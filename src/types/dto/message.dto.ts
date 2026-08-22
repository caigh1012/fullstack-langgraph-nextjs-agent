import { FileAttachment } from '../common/message';

/**
 * 消息 dto
 */
export interface MessageDto {
  threadId: string;
  content: string;
  model?: string;
  provider?: string;
  allowTool?: 'allow' | 'deny';
  approveAllTools?: boolean;
  attachments?: FileAttachment[];
}
