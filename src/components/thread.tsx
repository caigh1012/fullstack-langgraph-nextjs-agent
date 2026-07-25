'use client';

import MessageInput from './message-input';
import { Conversation, ConversationContent } from './ai-elements/conversation';
import MessageList from './message-list';
import { useChatMessage } from '@/hooks/use-chat-message';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { PromptInputMessage } from './ai-elements/prompt-input';
import { useThreadContext } from '@/contexts/thread-context';

interface ThreadProps {
  threadId: string;
  onFirstMessageSent?: (title: string) => void;
}

export default function Thread({ threadId, onFirstMessageSent }: ThreadProps) {
  const { firstMessage, setFirstMessage } = useThreadContext();
  const { messages, isLoadingHistory, sendMessage } = useChatMessage({ threadId });

  const handleFirstMessageSent = useCallback(
    async (message: PromptInputMessage) => {
      const wasEmpty = messages.length === 0;
      if (wasEmpty && onFirstMessageSent) {
        setFirstMessage(message);
        await onFirstMessageSent(message.text);
        return;
      }
      sendMessage(message);
    },
    [messages, onFirstMessageSent, sendMessage, setFirstMessage],
  );

  useEffect(() => {
    if (firstMessage) {
      console.log(firstMessage, '<___firstMessage');
      sendMessage(firstMessage);
      setFirstMessage(null);
    }
  }, [firstMessage, setFirstMessage, sendMessage]);

  if (isLoadingHistory) {
    return (
      <div className="bg-background/95 supports-backdrop-filter:bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-2">Loading conversation history...</p>
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
                <MessageInput sendMessage={handleFirstMessageSent} />
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
            <MessageInput sendMessage={handleFirstMessageSent} />
          </div>
        </div>
      )}
    </div>
  );
}
