import { MessageResponse } from '@/types/messages';
import HumanMessage from './human-message';
import AiMessage from './ai-message';

export default function MessageList({ messages }: { messages: MessageResponse[] }) {
  const uniqueMessages = messages.reduce((acc: MessageResponse[], message) => {
    const isDuplicate = acc.some((m) => m.data?.id === message.data?.id);
    if (!isDuplicate) {
      acc.push(message);
    }
    return acc;
  }, []);

  return (
    <>
      {uniqueMessages.map((message: MessageResponse) => {
        if (message.type === 'human') {
          return (
            <HumanMessage
              key={message.data?.id}
              message={message}
            />
          );
        }
        if (message.type === 'ai') {
          return (
            <AiMessage
              key={message.data?.id}
              message={message}
            />
          );
        }
      })}
    </>
  );
}
