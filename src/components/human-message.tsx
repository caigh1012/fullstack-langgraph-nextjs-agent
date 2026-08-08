import { BasicMessageData, MessageResponse } from '@/types/messages';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { UserRound } from 'lucide-react';
import { toProtocolRelativeUrl } from '@/utils/get-url';

export default function HumanMessage({ message }: { message: MessageResponse }) {
  const { userInfo } = useUserInfoContext();
  const data = message.data as BasicMessageData;
  const avatarUrl = toProtocolRelativeUrl(userInfo?.avatarUrl);
  const avatarAlt = userInfo?.nickname || userInfo?.email || 'User avatar';
  return (
    <Message from="human">
      <div className="flex items-start gap-2">
        <MessageContent>{data.content || ''}</MessageContent>
        <Avatar className="shrink-0">
          {avatarUrl && (
            <AvatarImage
              src={avatarUrl}
              alt={avatarAlt}
            />
          )}
          <AvatarFallback>
            <UserRound />
          </AvatarFallback>
        </Avatar>
      </div>
    </Message>
  );
}
