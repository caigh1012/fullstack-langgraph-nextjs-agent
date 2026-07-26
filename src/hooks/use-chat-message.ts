import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { HttpBusinessCode } from '@/constants/http';
import { MessageStreamDto } from '@/pojo/dto/agent/stream.dto';
import { AIMessageData, MessageResponse } from '@/types/messages';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();
  const currentMessageRef = useRef<MessageResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    isLoading: isLoadingHistory,
    isPending,
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

  // const stop = useCallback(() => {
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //     abortControllerRef.current = null;
  //   }
  // }, []);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (message: MessageStreamDto) => {
      if (!threadId) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const tempId = `temp-${Date.now()}`;
      const userMessage: MessageResponse = {
        type: 'human',
        data: {
          id: tempId,
          content: message.content,
        },
      };

      // 使用 queryClient 更新本地缓存
      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => [...old, userMessage]);

      setIsSending(true);

      try {
        fetchEventSource('/api/agent/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
          body: JSON.stringify({
            threadId,
            content: message.content,
            ...(message.model && { model: message.model }),
            ...(message.provider && { provider: message.provider }),
            ...(message.attachments && { attachments: message.attachments }),
          }),
          onmessage: (event) => {
            if (!event.data) return;
            const messageResponse = JSON.parse(event.data) as MessageResponse;
            const data = messageResponse.data as AIMessageData;
            // 根据 data.id 判断是否是新消息
            if (!currentMessageRef.current || currentMessageRef.current?.data?.id !== messageResponse.data?.id) {
              currentMessageRef.current = messageResponse;
              queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => [
                ...old,
                currentMessageRef.current!,
              ]);
            } else {
              const currentData = currentMessageRef.current.data as AIMessageData;
              const newContent =
                typeof data.content === 'string' && typeof currentData.content === 'string'
                  ? currentData.content + data.content
                  : data.content;

              // 更新当前消息内容
              currentMessageRef.current = {
                ...currentMessageRef.current,
                data: {
                  ...currentData,
                  content: newContent,
                  // Update tool call data if present
                  ...(data.tool_calls && { tool_calls: data.tool_calls }),
                  ...(data.additional_kwargs && { additional_kwargs: data.additional_kwargs }),
                  ...(data.response_metadata && { response_metadata: data.response_metadata }),
                },
              };

              queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => {
                // Find the in-flight assistant message by its stable response id
                const idx = old.findIndex((m) => m?.data?.id === currentMessageRef.current!.data.id);
                // If it's not in the cache (race or refresh), keep existing state
                if (idx === -1) return old;
                // Immutable update so React Query subscribers are notified
                const clone = [...old];
                // Replace only the updated message entry with the latest accumulated content
                clone[idx] = currentMessageRef.current!;
                return clone;
              });
            }
          },
          onerror: (error) => {
            const errorMsg: MessageResponse = {
              type: 'error',
              data: { id: `err-${Date.now()}`, content: `⚠️ ${error?.message || '发送消息失败'}` },
            };
            queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => [...old, errorMsg]);
            setIsSending(false);
            currentMessageRef.current = null;
            abortControllerRef.current = null;
            throw error;
          },
          onclose: () => {
            setIsSending(false);
            abortControllerRef.current = null;
            currentMessageRef.current = null;
          },
        });
      } catch (error) {
        throw error;
      }
    },
    [threadId, queryClient],
  );

  return {
    messages,
    isLoadingHistory,
    isPending,
    isSending,
    historyError,
    sendMessage,
    refetchMessages: refetchMessagesQuery,
  };
}
