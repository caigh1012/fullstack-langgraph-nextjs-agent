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

export interface FileAttachment {
  url: string;
  key: string;
  name: string;
  type: string;
  size: number;
}
