import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { HttpBusinessCode } from '@/constants/http';
import { AIMessageData, MessageResponse, ToolCall } from '@/types/vo/message.vo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStream, FetchStreamTransport } from '@langchain/langgraph-sdk/react';
import { toast } from 'sonner';
import { Message } from '@/types/common/message';

export interface UseChatMessageReturn {
  messages: MessageResponse[];
  isLoadingHistory: boolean;
  isPending: boolean;
  isSending: boolean;
  historyError: Error | null;
  sendMessage: (message: PromptInputMessage) => Promise<void>;
  refetchMessages: () => Promise<unknown>;
}

interface UseChatMessageProps {
  threadId?: string;
}

export function useChatMessage({ threadId }: UseChatMessageProps) {
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
    onError: () => {
      toast.error('请求失败');
      currentMessageRef.current = null;
      // 失败时也要清掉占位，避免一直转圈
      const pendingId = pendingAiIdRef.current;
      if (pendingId && threadId) {
        queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) =>
          old.filter((m) => !(m.type === 'ai' && m.data?.id === pendingId)),
        );
        pendingAiIdRef.current = null;
      }
    },
  });

  const processAIMessage = useCallback((message: Record<string, unknown>): MessageResponse | null => {
    const hasToolCall =
      Array.isArray(message.content) &&
      message.content.some((item: unknown) => item && typeof item === 'object' && 'functionCall' in item);
    if (hasToolCall) {
      // 返回完整的 AIMessageData 以保留所有信息
      return {
        type: 'ai',
        data: {
          id: (message.id as string) || Date.now().toString(),
          content: typeof message.content === 'string' ? message.content : '',
          tool_calls: (message.tool_calls as ToolCall[]) || undefined,
          additional_kwargs: (message.additional_kwargs as Record<string, unknown>) || undefined,
          response_metadata: (message.response_metadata as Record<string, unknown>) || undefined,
        },
      };
    } else {
      // 处理常规文本内容——从各种内容类型中提取文本
      let text = '';
      if (typeof message.content === 'string') {
        text = message.content;
      } else if (Array.isArray(message.content)) {
        text = message.content
          .map((c: string | { text?: string }) => (typeof c === 'string' ? c : c?.text || ''))
          .join('');
      } else {
        text = String(message.content ?? '');
      }

      // 提取推理内容（reasoning_content），即使主文本为空也需要保留
      const additionalKwargs = (message.additional_kwargs as Record<string, unknown>) || undefined;
      const reasoningRaw =
        (additionalKwargs?.reasoning_content as unknown) ??
        (additionalKwargs?.reasoning as unknown) ??
        (additionalKwargs?.thoughts as unknown);
      const reasoning = typeof reasoningRaw === 'string' ? reasoningRaw : '';

      // content 或 reasoning 任意一个非空时，才返回消息
      if (text.trim() || reasoning.trim()) {
        return {
          type: 'ai',
          data: {
            id: (message.id as string) || Date.now().toString(),
            content: text,
            ...(additionalKwargs && { additional_kwargs: additionalKwargs }),
          },
        };
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (!threadId || stream.messages.length === 0) return;

    const message = stream.messages[stream.messages.length - 1];

    // 只处理 AI 类型的消息，Human 消息已由 sendMessage 添加到缓存
    if (message.type !== 'ai' && (message as Record<string, unknown>).constructor?.name !== 'AIMessage') return;

    const processedMessage = processAIMessage(message);

    if (!processedMessage) return;
    const data = processedMessage.data as AIMessageData;

    // 检查是否是新消息
    if (!currentMessageRef.current || currentMessageRef.current?.data?.id !== processedMessage.data?.id) {
      // 真实 AI 首条到达：先把乐观插入的 AI 占位从缓存中剔除，再追加真实消息
      const pendingId = pendingAiIdRef.current;
      const realMessage = processedMessage;
      currentMessageRef.current = realMessage;
      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => {
        const filtered = pendingId ? old.filter((m) => !(m.type === 'ai' && m.data?.id === pendingId)) : old;
        return [...filtered, realMessage];
      });
      if (pendingId) {
        pendingAiIdRef.current = null;
      }
    } else {
      const currentData = currentMessageRef.current.data as AIMessageData;

      // 更新当前消息内容
      currentMessageRef.current = {
        ...currentMessageRef.current,
        data: {
          ...currentData,
          content: data.content,
          // 如果存在，请更新工具调用数据
          ...(data.tool_calls && { tool_calls: data.tool_calls }),
          ...(data.additional_kwargs && { additional_kwargs: data.additional_kwargs }),
          ...(data.response_metadata && { response_metadata: data.response_metadata }),
        },
      };

      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => {
        // 查找当前消息在缓存中的索引
        const idx = old.findIndex((m) => m?.data?.id === currentMessageRef.current!.data.id);
        // 如果消息不存在，直接返回旧缓存
        if (idx === -1) return old;
        // 更新缓存中的消息内容
        const clone = [...old];
        // 替换缓存中的消息内容
        clone[idx] = currentMessageRef.current!;
        return clone;
      });
    }
  }, [stream.messages, threadId, processAIMessage]);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (message: Message) => {
      if (!threadId) return;

      const tempId = `temp-${Date.now()}`;
      const aiTempId = `pending-ai-${Date.now()}`;
      const userMessage: MessageResponse = {
        type: 'human',
        data: {
          id: tempId,
          content: message.content,
          ...(message.attachments && { attachments: message.attachments }),
        },
      };

      // 乐观插入一条 AI 占位消息：让 AiMessage 立即渲染 “正在思考” UI，
      // 直到 stream.messages 出现真实 AI 消息再被替换
      const aiPlaceholder: MessageResponse = {
        type: 'ai',
        data: {
          id: aiTempId,
          content: '',
        },
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
    sendMessage,
    refetchMessages: refetchMessagesQuery,
  };
}
