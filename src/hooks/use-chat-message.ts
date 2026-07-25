import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { HttpBusinessCode } from '@/constants/http';
import { AIMessageData, MessageResponse } from '@/types/messages';
import { getUrl } from '@/utils/get-fetch-url';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface UseChatMessageReturn {
  messages: MessageResponse[];
  isLoadingHistory: boolean;
  historyError: Error | null;
  sendMessage: (message: PromptInputMessage) => Promise<void>;
  refetchMessages: () => Promise<unknown>;
}

export function useChatMessage({ threadId }: { threadId: string }) {
  const queryClient = useQueryClient();
  const currentMessageRef = useRef<MessageResponse | null>(null);
  const [sendError, setSendError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 请求历史消息
   */
  const fetchMessageHistory = useCallback(async (threadId: string): Promise<MessageResponse[]> => {
    const response = await fetch(`${getUrl('history')}/${threadId}`);
    if (!response.ok) {
      let errorMessage = 'Failed to load message history';
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || errorMessage;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (data.code === HttpBusinessCode.FAIL) {
      toast.error(data.message || 'Failed to load message history');
      throw new Error(data.message || 'Failed to load message history');
    }

    return data?.data || [];
  }, []);

  const {
    data: messages = [],
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
      void refetchMessagesQuery();
    }
  }, [threadId, refetchMessagesQuery]);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (message: PromptInputMessage) => {
      if (!threadId) return;
      const tempId = `temp-${Date.now()}`;
      const userMessage: MessageResponse = {
        id: tempId,
        role: 'user',
        type: 'human',
        data: {
          content: message.text,
        },
      };

      // 使用 queryClient 更新本地缓存
      queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => [...old, userMessage]);

      setIsSending(true);
      setSendError(null);

      fetchEventSource(getUrl('stream'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          content: message.text,
        }),
        onmessage: (event) => {
          if (!event.data) return;

          const messageResponse = JSON.parse(event.data) as MessageResponse;
          console.log(messageResponse, '<___messageResponse');

          const data = messageResponse.data as AIMessageData;

          // 根据data.id判断是否是新消息
          if (!currentMessageRef.current || currentMessageRef.current.id !== messageResponse.id) {
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
              role: 'assistant',
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
              const idx = old.findIndex((m) => m?.id === currentMessageRef.current!.id);
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
        onclose: () => {
          setIsSending(false);
          currentMessageRef.current = null;
        },
        onerror: (error) => {
          setIsSending(false);
          setSendError(error);
          throw error; //
        },
      });
    },
    [threadId, queryClient],
  );

  return {
    messages,
    isLoadingHistory,
    historyError,
    sendMessage,
    refetchMessages: refetchMessagesQuery,
  };
}
