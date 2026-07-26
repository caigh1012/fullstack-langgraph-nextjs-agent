'use client';

import { MessageResponse } from '@/types/messages';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { getMessageContent } from '@/utils/message';
import rehypeKatex from 'rehype-katex';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function AiMessage({ message }: { message: MessageResponse }) {
  const { resolvedTheme } = useTheme();
  const messageContent = getMessageContent(message);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', resolvedTheme || 'system');
  }, [resolvedTheme]);

  return (
    <Message from="ai">
      <div className="flex items-start gap-2">
        <Avatar className="shrink-0">
          <AvatarImage src="/logo.svg" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <MessageContent>
          {messageContent && (
            <MDEditor.Markdown
              source={messageContent}
              style={{
                backgroundColor: 'transparent',
                color: 'inherit',
                padding: '0',
                overflow: 'auto',
              }}
              rehypePlugins={[rehypeKatex]}
            />
          )}
        </MessageContent>
      </div>
    </Message>
  );
}
