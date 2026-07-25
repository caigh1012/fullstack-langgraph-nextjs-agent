import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageResponse } from '@/types/messages';

export default function MessageList({ messages }: { messages: MessageResponse[] }) {
  return (
    <>
      {messages.map(({ id, data, role }) => (
        <Message
          from={role}
          key={id}>
          <div className="flex items-start gap-2">
            {role === 'assistant' && (
              <Avatar className="shrink-0">
                <AvatarImage src="/logo.svg" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <MessageContent>{data.content || ''}</MessageContent>
            {role === 'user' && (
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
