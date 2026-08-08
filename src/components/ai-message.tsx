'use client';

import type { ReactNode } from 'react';
import { MessageResponse } from '@/types/messages';
import { Message, MessageContent } from './ai-elements/message';
import { Avatar, AvatarImage } from './ui/avatar';
import { Shimmer } from './ai-elements/shimmer';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './ai-elements/reasoning';

import { getMessageContent, getMessageReasoning } from '@/utils/message';
import rehypeKatex from 'rehype-katex';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

interface AiMessageProps {
  message: MessageResponse;
  isStreaming?: boolean;
}

function getReasoningMessage(isStreaming: boolean, duration?: number): ReactNode {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1}>正在思考...</Shimmer>;
  }
  if (duration === undefined) {
    return <p>已完成思考</p>;
  }
  return <p>已思考 (用时 {duration} 秒)</p>;
}

export default function AiMessage({ message, isStreaming = false }: AiMessageProps) {
  const { resolvedTheme } = useTheme();
  const messageContent = getMessageContent(message);
  const reasoning = getMessageReasoning(message);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', resolvedTheme || 'system');
  }, [resolvedTheme]);

  return (
    <Message from="ai">
      <div className="flex items-start gap-2">
        <Avatar
          size="lg"
          className="shrink-0 after:border-0">
          <AvatarImage src="/robot.svg" />
        </Avatar>
        <MessageContent>
          {reasoning && (
            <Reasoning
              autoClose={false}
              isStreaming={isStreaming}
              defaultOpen={true}>
              <ReasoningTrigger getThinkingMessage={getReasoningMessage} />
              <ReasoningContent>{reasoning}</ReasoningContent>
            </Reasoning>
          )}
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
