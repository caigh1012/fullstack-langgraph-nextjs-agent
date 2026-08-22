import { MessageResponse } from '@/types/vo/message.vo';
import { Message, MessageContent } from './ai-elements/message';
import UserAvatar from './user-avatar';
import { useUserInfoContext } from '@/contexts/userinfo-context';
import { Attachment, AttachmentInfo, AttachmentPreview, Attachments } from './ai-elements/attachments';
import Image from 'next/image';
import { ProcessedAttachment } from '@/lib/minio/content';
import { getMessageContent } from '@/utils/message';
import { cn } from '@/lib/utils';
import { FileAttachment } from '@/types/common/message';

export default function HumanMessage({ message }: { message: MessageResponse }) {
  const { userInfo } = useUserInfoContext();
  const avatarUrl = userInfo?.avatarUrl;
  const avatarAlt = userInfo?.nickname || userInfo?.email || 'User avatar';

  const attachments = [...(message.attachments || [])];

  if (message.content && Array.isArray(message.content)) {
    const contentAttachments = (message.content as ProcessedAttachment[])
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

  // 区分图片与其他文件，分别采用不同的展示样式
  const imageAttachments = attachments.filter((att) => att.type.startsWith('image/'));
  const fileAttachments = attachments.filter((att) => !att.type.startsWith('image/'));
  const messageContent = getMessageContent(message);
  const hasMessageContent = !!messageContent;

  return (
    <Message from="human">
      <div className="flex items-start gap-2">
        <MessageContent>
          {/* 图片附件：缩略图展示 */}
          {imageAttachments.length > 0 && (
            <div className={cn('flex flex-wrap gap-2', hasMessageContent && 'mb-2')}>
              {imageAttachments.map((attachment) => (
                <Image
                  alt={attachment.name}
                  className="h-20 w-20 rounded-lg object-contain"
                  height={80}
                  key={attachment.key}
                  sizes="80px"
                  src={attachment.url}
                  unoptimized
                  width={80}
                />
              ))}
            </div>
          )}
          {/* 文件附件：小文件 + 文件名 */}
          {fileAttachments.length > 0 && (
            <Attachments
              className={cn('ml-0 w-full flex-row', hasMessageContent && 'mb-2')}
              variant="list">
              {fileAttachments.map((attachment) => (
                <Attachment
                  className="p-0 pl-0.5 pr-4.5 gap-0"
                  data={{
                    id: attachment.key,
                    type: 'file',
                    mediaType: attachment.type,
                    filename: attachment.name,
                    url: attachment.url,
                  }}
                  key={attachment.key}>
                  <AttachmentPreview />
                  <AttachmentInfo showMediaType />
                </Attachment>
              ))}
            </Attachments>
          )}
          {/* 消息内容 */}
          {messageContent ? <div> {messageContent}</div> : null}
        </MessageContent>
        <UserAvatar
          avatarUrl={avatarUrl}
          avatarAlt={avatarAlt}
          className="shrink-0"
        />
      </div>
    </Message>
  );
}
