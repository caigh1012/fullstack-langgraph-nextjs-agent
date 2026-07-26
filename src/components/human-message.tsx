import { BasicMessageData, MessageResponse } from '@/types/messages';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function HumanMessage({ message }: { message: MessageResponse }) {
  const data = message.data as BasicMessageData;
  return (
    <Message from="human">
      <div className="flex items-start gap-2">
        <MessageContent>{data.content || ''}</MessageContent>
        <Avatar className="shrink-0">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </Message>
  );
}
