'use client';

import MessageInput from './message-input';
import { Conversation, ConversationContent } from './ai-elements/conversation';
import MessageList from './message-list';
import { useChatMessage } from '@/hooks/use-chat-message';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useFirstMessageContext } from '@/contexts/first-message-context';
import { MessageStreamDto } from '@/pojo/dto/agent/stream.dto';

interface ThreadProps {
  threadId?: string;
  onFirstMessageSent?: (title: string) => void;
}

export default function Thread({ threadId, onFirstMessageSent }: ThreadProps) {
  const { firstMessage, setFirstMessage } = useFirstMessageContext();
  const { messages, isLoadingHistory, isPending, isSending, sendMessage } = useChatMessage({ threadId });

  /**
   * 处理输入的消息，如果是第一个消息，先进行存储调用 onFirstMessageSent 回调函数
   */
  const handleMessageSent = useCallback(
    async (message: MessageStreamDto) => {
      const wasEmpty = messages.length === 0;
      // 如果没有 threadId，且是第一个消息，调用 onFirstMessageSent 回调函数
      if (wasEmpty && onFirstMessageSent) {
        // 先存储第一个消息，等 onFirstMessageSent 回调函数执行完成后，再发送消息到服务器
        setFirstMessage(message);
        await onFirstMessageSent(message.content);
        return;
      }
      // 非二次消息，直接发送消息
      sendMessage(message);
    },
    [messages, onFirstMessageSent, sendMessage, setFirstMessage],
  );

  useEffect(() => {
    // 需要等历史消息加载完成之后，才能通过  queryClient.setQueryData(['messages', threadId], (old: MessageResponse[] = []) => [...old, userMessage]); 设置消息
    // 如果没有进行一次请求，就找不到 setQueryData(['messages', threadId]) 这个 key
    if (!isPending && !isSending && firstMessage) {
      // 如果有 threadId，且有第一个消息，直接发送消息到服务器
      sendMessage(firstMessage);
      setFirstMessage(null);
    }
  }, [firstMessage, isPending, isSending, setFirstMessage, sendMessage]);

  /**
   * 第一次发送会话时，不展示 loading 状态
   */
  if (isLoadingHistory && threadId && !firstMessage) {
    return (
      <div className="bg-background/95 supports-backdrop-filter:bg-background/60 absolute inset-0 flex items-center justify-center gap-2 px-4 backdrop-blur">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">对话加载中...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {messages.length > 0 ? (
        <>
          <div className="min-h-0 flex-1 w-full m-auto lg:w-[92%] xl:w-[85%] 2xl:w-[75%]">
            <Conversation className="h-full">
              <ConversationContent scrollClassName="no-scrollbar">
                <MessageList messages={messages} />
              </ConversationContent>
            </Conversation>
          </div>
          <div className="shrink-0">
            <div className="w-full p-4 pb-6">
              <div className="mx-auto max-w-3xl">
                <MessageInput
                  sendMessage={handleMessageSent}
                  isSending={isSending}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-3xl px-4">
            <div className="mb-5 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chat with your Agent</h1>
              <p className="text-muted-foreground mt-2">Start a new conversation by sending a message</p>
            </div>
            <MessageInput
              sendMessage={handleMessageSent}
              isSending={isSending}
            />
          </div>
        </div>
      )}
    </div>
  );
}
