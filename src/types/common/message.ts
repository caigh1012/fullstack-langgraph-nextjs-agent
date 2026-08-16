import { MessageDto } from '../dto/message.dto';

export type Message = Omit<MessageDto, 'threadId'>;

export interface FileAttachment {
  url: string;
  key: string;
  name: string;
  type: string;
  size: number;
}
