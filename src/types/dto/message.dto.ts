import { FileAttachment } from '../common/message';

/**
 * 消息 dto
 */
export interface MessageDto {
  threadId: string;
  content: string;
  model?: string;
  provider?: string;
  attachments?: FileAttachment[];
}
