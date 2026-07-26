import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageResponse } from '@/types/messages';

export default function MessageList({ messages }: { messages: MessageResponse[] }) {
  return (
    <>
      {messages.map(({ type, data }) => (
        <Message
          from={type as 'human' | 'ai'}
          key={data?.id || ''}>
          <div className="flex items-start gap-2">
            {type === 'ai' && (
              <Avatar className="shrink-0">
                <AvatarImage src="/logo.svg" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <MessageContent>{data.content || ''}</MessageContent>
            {type === 'human' && (
              <Avatar className="shrink-0">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
          </div>
        </Message>
      ))}
    </>
  );
}
