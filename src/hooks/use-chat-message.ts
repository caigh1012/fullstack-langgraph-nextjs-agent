import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { HttpBusinessCode } from '@/constants/http';
import { MessageResponse } from '@/types/vo/message.vo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStream, FetchStreamTransport } from '@langchain/langgraph-sdk/react';
import { toast } from 'sonner';
import { Message } from '@/types/common/message';
import { useUISettingContext } from '@/contexts/ui-settings-context';

export interface UseChatMessageReturn {
  messages: MessageResponse[];
  isLoadingHistory: boolean;
  isPending: boolean;
  isSending: boolean;
  approveToolExecution: (toolCallId: string, action: 'allow' | 'deny') => Promise<void>;
  historyError: Error | null;
  sendMessage: (message: PromptInputMessage) => Promise<void>;
  refetchMessages: () => Promise<unknown>;
}

interface UseChatMessageProps {
  threadId?: string;
}

export function useChatMessage({ threadId }: UseChatMessageProps) {
  const { model } = useUISettingContext();
  const currentMessageRef = useRef<MessageResponse | null>(null);
  // 用于记录乐观插入的 AI 占位消息 id，首条真实 AI 消息到达时移除
  const pendingAiIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  /**
   * 请求历史消息
   */
  const fetchMessageHistory = useCallback(async (threadId: string): Promise<MessageResponse[]> => {
    const response = await fetch(`/api/agent/history/${threadId}`);
    if (!response.ok) {
      let errorMessage = '获取历史消息失败';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || '获取历史消息失败');
      throw new Error(data.message || '获取历史消息失败');
    }

    return data?.data || [];
  }, []);

  const {
    data: messages = [],
    isPending: isPendingHistory,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchMessagesQuery,
  } = useQuery<MessageResponse[]>({
    queryKey: ['messages', threadId],
    enabled: !!threadId,
    queryFn: () => (threadId ? fetchMessageHistory(threadId) : Promise.resolve([])),
  });

  /**
   * 监听 threadId 变化，重新请求历史消息
   */
  useEffect(() => {
    if (threadId) {
      refetchMessagesQuery();
    }
  }, [threadId, refetchMessagesQuery]);

  const transport = useMemo(
    () =>
      new FetchStreamTransport({
        apiUrl: '/api/agent/stream',
        defaultHeaders: {
          'Content-Type': 'application/json',
        },
        // 请求的拦截器
        onRequest: async (_url: string, init: RequestInit) => {
          const customBody = JSON.stringify({
            ...(JSON.parse(init.body as string)?.input || {}),
          });
          return {
            ...init,
            body: customBody,
          };
        },
      }),
    [],
  );

  const stream = useStream({
    transport,
    threadId: threadId ?? null,
    onFinish: () => {
      currentMessageRef.current = null;
      pendingAiIdRef.current = null;
    },
    onError: (error) => {
      toast.error('请求失败');
      currentMessageRef.current = null;

      const errorContent =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : error !== null && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : '请求失败';

      // 失败时也要清掉占位，避免一直转圈，并追加一条错误消息供 ErrorMessage 渲染
      const pendingId = pendingAiIdRef.current;
      if (threadId) {
        queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => {
          const filtered = pendingId ? old.filter((m) => !(m.type === 'ai' && m?.id === pendingId)) : old;
          return [...filtered, { id: `error-${Date.now()}`, type: 'error', content: errorContent }];
        });
        pendingAiIdRef.current = null;
      }
    },
  });

  useEffect(() => {
    if (!threadId || stream.messages.length === 0) return;

    const message = stream.messages[stream.messages.length - 1];

    // 只处理 AI / tool 类型的消息，Human 消息已由 sendMessage 添加到缓存
    if (
      message.type !== 'ai' &&
      message.type !== 'tool' &&
      (message as Record<string, unknown>).constructor?.name !== 'AIMessage'
    )
      return;

    // const processedMessage = processAIMessage(message);

    if (!message) return;
    // const data = message;

    // 检查是否是新消息
    if (!currentMessageRef.current || currentMessageRef.current?.id !== message.id) {
      // 真实 AI 首条到达：先把乐观插入的 AI 占位从缓存中剔除，再追加真实消息
      const pendingId = pendingAiIdRef.current;
      const realMessage = message;

      currentMessageRef.current = realMessage as MessageResponse;

      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => {
        // 过滤掉占位消息
        const filtered = pendingId ? old.filter((m) => !(m.type === 'ai' && m?.id === pendingId)) : old;
        return [...filtered, realMessage];
      });
      if (pendingId) {
        pendingAiIdRef.current = null;
      }
    } else {
      // 更新当前消息内容
      currentMessageRef.current = message as MessageResponse;

      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => {
        // 查找当前消息在缓存中的索引
        const idx = old.findIndex((m) => m?.id === currentMessageRef.current!.id);
        // 如果消息不存在，直接返回旧缓存
        if (idx === -1) return old;
        // 更新缓存中的消息内容
        const clone = [...old];
        // 替换缓存中的消息内容
        clone[idx] = currentMessageRef.current!;
        return clone;
      });
    }
  }, [stream.messages, threadId]);

  const approveToolExecution = useCallback(
    async (toolCallId: string, action: 'allow' | 'deny') => {
      if (!threadId) return;
      stream.submit({
        model: model.model,
        provider: model.provider,
        threadId,
        content: '',
        allowTool: action,
      });
    },
    [threadId, stream],
  );

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (message: Message) => {
      if (!threadId) return;

      const tempId = `temp-${Date.now()}`;
      const aiTempId = `pending-ai-${Date.now()}`;
      const userMessage: MessageResponse = {
        id: tempId,
        type: 'human',
        content: message.content,
        ...(message.attachments && { attachments: message.attachments }),
      };

      // 乐观插入一条 AI 占位消息：让 AiMessage 立即渲染 “正在思考” UI，
      // 直到 stream.messages 出现真实 AI 消息再被替换
      const aiPlaceholder: MessageResponse = {
        type: 'ai',
        id: aiTempId,
        content: '',
      };

      pendingAiIdRef.current = aiTempId;
      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => [
        ...old,
        userMessage,
        aiPlaceholder,
      ]);

      await stream.submit({
        threadId,
        content: message.content,
        ...(message.model && { model: message.model }),
        ...(message.provider && { provider: message.provider }),
        ...(message.allowTool !== undefined && { allowTool: message.allowTool }),
        ...(message.approveAllTools !== undefined && { approveAllTools: message.approveAllTools }),
        ...(message.attachments && { attachments: message.attachments }),
      });
    },
    [threadId, stream, queryClient],
  );

  return {
    messages,
    isLoadingHistory,
    isPending: isPendingHistory,
    isSending: stream.isLoading,
    historyError,
    approveToolExecution,
    sendMessage,
    refetchMessages: refetchMessagesQuery,
  };
}
