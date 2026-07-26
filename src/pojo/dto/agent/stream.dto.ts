import { FileAttachment } from '@/types/messages';

export interface MessageStreamDto {
  content: string;
  model?: string;
  provider?: string;
  attachments?: FileAttachment[];
}
