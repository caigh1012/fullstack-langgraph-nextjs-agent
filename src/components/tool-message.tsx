'use client';

import { MessageResponse } from '@/types/vo/message.vo';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from './ai-elements/tool';
import { getToolCalls, getToolResult, ToolApprovalCallbacks } from '@/utils/message';
import { Button } from './ui/button';
import { Ban, Check } from 'lucide-react';

interface ToolMessageProps {
  message: MessageResponse;
  messages?: MessageResponse[];
  showApprovalButtons?: boolean;
  approvalCallbacks?: ToolApprovalCallbacks;
}

/**
 * 渲染 AI 消息中的工具调用
 */
export default function ToolMessage({ message, messages, showApprovalButtons, approvalCallbacks }: ToolMessageProps) {
  const toolCalls = getToolCalls(message);

  if (toolCalls.length === 0) {
    return null;
  }

  return (
    <>
      {toolCalls.map((toolCall) => {
        const result = messages ? getToolResult(toolCall.id, messages) : null;
        const state: 'output-available' | 'approval-requested' = result ? 'output-available' : 'approval-requested';
        // 将 LangChain 工具调用适配为 ai-elements/tool 期望的 ToolUIPart 形态
        const toolPart = {
          type: 'dynamic-tool' as const,
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          state,
          input: toolCall.args,
          output: result?.content,
          errorText: undefined,
        };
        const isPending = !result;
        return (
          <Tool
            key={toolCall.id}
            defaultOpen>
            <ToolHeader
              type="dynamic-tool"
              toolName={toolCall.name}
              state={state}
            />
            <ToolContent>
              <ToolInput input={toolPart.input} />
              {result && (
                <ToolOutput
                  output={result.content}
                  errorText={toolPart.errorText}
                />
              )}
              {/* 待审批时：仅最新消息且提供回调时展示审批按钮 */}
              {isPending && showApprovalButtons && approvalCallbacks && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => approvalCallbacks.onDeny(toolCall.id)}>
                    <Ban className="size-4" />
                    拒绝
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => approvalCallbacks.onApprove(toolCall.id)}>
                    <Check className="size-4" />
                    允许执行
                  </Button>
                </div>
              )}
            </ToolContent>
          </Tool>
        );
      })}
    </>
  );
}
