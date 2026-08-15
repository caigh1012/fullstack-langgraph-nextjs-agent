'use client';

import type { ReactNode } from 'react';
import { MessageResponse } from '@/types/messages';
import { Message, MessageAction, MessageActions, MessageContent, MessageToolbar } from './ai-elements/message';
import { Avatar, AvatarImage } from './ui/avatar';
import { Shimmer } from './ai-elements/shimmer';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './ai-elements/reasoning';

import { getMessageContent, getMessageReasoning } from '@/utils/message';
import { ArrowUpRight, Check, Copy, RefreshCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import rehypeKatex from 'rehype-katex';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import { toast } from 'sonner';

interface AiMessageProps {
  message: MessageResponse;
  isStreaming?: boolean;
}

const staticActionClassName =
  'flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-muted-foreground';

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
  const [copied, setCopied] = useState(false);
  const [copyState, copyToClipboard] = useCopyToClipboard();
  const copyResetTimeoutRef = useRef<number | null>(null);
  const pendingCopyValueRef = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', resolvedTheme || 'system');
  }, [resolvedTheme]);

  useEffect(
    () => () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!pendingCopyValueRef.current) {
      return;
    }

    if (copyState.error) {
      pendingCopyValueRef.current = null;
      toast.error('复制失败，请稍后重试');
      return;
    }

    if (copyState.value !== pendingCopyValueRef.current) {
      return;
    }

    setCopied(true);
    toast.success('内容复制成功');

    if (copyResetTimeoutRef.current) {
      window.clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);

    pendingCopyValueRef.current = null;
  }, [copyState.error, copyState.value]);

  const handleCopy = useCallback(() => {
    if (!messageContent) {
      return;
    }

    pendingCopyValueRef.current = messageContent;
    copyToClipboard(messageContent);
  }, [copyToClipboard, messageContent]);

  return (
    <Message from="ai">
      <div className="flex items-start gap-2">
        <Avatar
          size="lg"
          className="shrink-0 after:border-0">
          <AvatarImage src="/robot.svg" />
        </Avatar>
        <MessageContent>
          {(isStreaming || reasoning) && (
            <Reasoning
              autoClose={false}
              isStreaming={isStreaming}
              defaultOpen={true}>
              <ReasoningTrigger getThinkingMessage={getReasoningMessage} />
              <ReasoningContent>{reasoning ?? ''}</ReasoningContent>
            </Reasoning>
          )}
          {messageContent && (
            <>
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
              <MessageToolbar className="mt-2">
                <MessageActions>
                  <MessageAction
                    className="cursor-pointer text-muted-foreground"
                    onClick={handleCopy}
                    tooltip={copied ? '已复制' : '复制'}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </MessageAction>
                  <span className={staticActionClassName}>
                    <RefreshCcw className="size-4" />
                  </span>
                  <span className={staticActionClassName}>
                    <ThumbsUp className="size-4" />
                  </span>
                  <span className={staticActionClassName}>
                    <ThumbsDown className="size-4" />
                  </span>
                  <span className={staticActionClassName}>
                    <ArrowUpRight className="size-4" />
                  </span>
                </MessageActions>
              </MessageToolbar>
            </>
          )}
          {/* 本回答由 AI 生成，内容仅供参考，请仔细甄别 */}
        </MessageContent>
      </div>
    </Message>
  );
}
