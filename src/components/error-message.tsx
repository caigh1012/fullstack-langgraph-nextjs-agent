'use client';

import { MessageResponse } from '@/types/vo/message.vo';
import { Message, MessageContent } from './ai-elements/message';
import { getMessageContent } from '@/utils/message';
import { CircleAlert } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';

interface ErrorMessageProps {
  message: MessageResponse;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  const content = getMessageContent(message);

  return (
    <Message from="ai">
      <div className="flex items-start gap-2">
        <Avatar
          size="lg"
          className="shrink-0 after:border-0">
          <AvatarImage src="/robot.svg" />
        </Avatar>
        <MessageContent>
          <div className="flex items-center gap-2 text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm">{content || '发生错误，请稍后重试'}</p>
          </div>
        </MessageContent>
      </div>
    </Message>
  );
}
