import { MessageDto } from '../dto/message.dto';

export type Message = Omit<MessageDto, 'threadId'>;
