import { BasicMessageData, MessageResponse } from '@/types/messages';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { UserRound } from 'lucide-react';

export default function HumanMessage({ message }: { message: MessageResponse }) {
  const { userInfo } = useUserInfoContext();
  const data = message.data as BasicMessageData;
  return (
    <Message from="human">
      <div className="flex items-start gap-2">
        <MessageContent>{data.content || ''}</MessageContent>
        <Avatar className="shrink-0">
          {userInfo?.avatarUrl && (
            <>
              <AvatarImage src={userInfo.avatarUrl} />
              <AvatarFallback>
                <UserRound />
              </AvatarFallback>
            </>
          )}
          <AvatarFallback>
            <UserRound />
          </AvatarFallback>
        </Avatar>
      </div>
    </Message>
  );
}
