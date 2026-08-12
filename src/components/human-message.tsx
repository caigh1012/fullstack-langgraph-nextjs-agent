import { BasicMessageData, FileAttachment, MessageResponse } from '@/types/messages';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { Attachment, AttachmentPreview, Attachments } from './ai-elements/attachments';
import { UserRound } from 'lucide-react';
import { ProcessedAttachment } from '@/lib/minio/content';
import { getMessageContent } from '@/utils/message';

export default function HumanMessage({ message }: { message: MessageResponse }) {
  const data = message.data as BasicMessageData;

  const { userInfo } = useUserInfoContext();
  const avatarUrl = userInfo?.avatarUrl;
  const avatarAlt = userInfo?.nickname || userInfo?.email || 'User avatar';

  const attachments = [...(data.attachments || [])];

  if (message.data?.content && Array.isArray(message.data.content)) {
    const contentAttachments = (message.data.content as ProcessedAttachment[])
      // TODO: 待优化，需要加入其他类型的附件
      .filter(
        (item) =>
          // Images/PDFs with image_url
          item.type === 'image' ||
          // Text files with file_metadata
          (item.type === 'text' && 'file_metadata' in item && !!item.file_metadata),
      )
      .map((item) => {
        if (item.file_metadata) {
          return item.file_metadata;
        }
        return null;
      })
      .filter((att): att is FileAttachment => att !== null);
    attachments.push(...contentAttachments);
  }

  return (
    <Message from="human">
      <div className="flex items-start gap-2">
        <MessageContent>
          {/* 附件内容 */}
          {attachments.length > 0 && (
            <Attachments
              className="mb-2 ml-0 w-full"
              variant="grid">
              {attachments.map((attachment) => (
                <Attachment
                  data={{
                    id: attachment.key,
                    type: 'file',
                    mediaType: attachment.type,
                    filename: attachment.name,
                    url: attachment.url,
                  }}
                  key={attachment.key}>
                  <AttachmentPreview />
                </Attachment>
              ))}
            </Attachments>
          )}
          {/* 消息内容 */}
          {getMessageContent(message)}
        </MessageContent>
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
