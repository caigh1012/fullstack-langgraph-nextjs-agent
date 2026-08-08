import { MessageResponse } from '@/types/messages';
import HumanMessage from './human-message';
import AiMessage from './ai-message';

interface MessageListProps {
  messages: MessageResponse[];
  isStreaming?: boolean;
}

export default function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const uniqueMessages = messages.reduce((acc: MessageResponse[], message) => {
    const isDuplicate = acc.some((m) => m.data?.id === message.data?.id);
    if (!isDuplicate) {
      acc.push(message);
    }
    return acc;
  }, []);

  // 仅最后一条 AI 消息可能是正在流式输出的消息
  const lastAiMessageId = (() => {
    for (let i = uniqueMessages.length - 1; i >= 0; i--) {
      if (uniqueMessages[i].type === 'ai') return uniqueMessages[i].data?.id;
    }
    return undefined;
  })();

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
              isStreaming={isStreaming && message.data?.id === lastAiMessageId}
            />
          );
        }
      })}
    </>
  );
}
