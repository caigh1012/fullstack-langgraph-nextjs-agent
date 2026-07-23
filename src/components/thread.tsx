'use client';

import { useState } from 'react';
import MessageInput from './message-input';
import { Conversation, ConversationContent } from './ai-elements/conversation';
import MessageList from './message-list';
import { PromptInputMessage } from './ai-elements/prompt-input';
import { useRouter } from 'next/navigation';

interface ThreadProps {
  threadId: string;
  onFirstMessageSent?: (threadId: string) => void;
}

interface Message {
  key: string;
  content: string;
  role: 'user' | 'assistant';
}

export default function Thread({ threadId }: ThreadProps) {
  console.log('触发了');

  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();

  const handleSubmit = (message: PromptInputMessage) => {
    // setMessages((prev) => [...prev, { key: nanoid(36), content: message.text, role: 'user' }]);
    router.replace(`/thread/${threadId}`);
  };

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
                <MessageInput sendMessage={handleSubmit} />
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
            <MessageInput sendMessage={handleSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}
