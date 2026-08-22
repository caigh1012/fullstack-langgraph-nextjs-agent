import HumanMessage from './human-message';
import AiMessage from './ai-message';
import ErrorMessage from './error-message';
import { MessageResponse } from '@/types/vo/message.vo';
import { ToolApprovalCallbacks } from '@/utils/message';
import { useUISettingContext } from '@/contexts/ui-settings-context';

interface MessageListProps {
  messages: MessageResponse[];
  isStreaming?: boolean;
  approveToolExecution?: (toolCallId: string, action: 'allow' | 'deny') => Promise<void>;
}

export default function MessageList({ messages, isStreaming = false, approveToolExecution }: MessageListProps) {
  const { approveAllTools } = useUISettingContext();

  const approvalCallbacks: ToolApprovalCallbacks | undefined = approveToolExecution
    ? {
        onApprove: (toolCallId: string) => approveToolExecution(toolCallId, 'allow'),
        onDeny: (toolCallId: string) => approveToolExecution(toolCallId, 'deny'),
      }
    : undefined;

  // 仅最后一条 AI 消息可能是正在流式输出的消息
  const lastAiMessageId = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'ai') return messages[i].id;
    }
    return undefined;
  })();

  return (
    <>
      {messages.map((message: MessageResponse, index) => {
        if (message.type === 'human') {
          return (
            <HumanMessage
              key={message.id}
              message={message}
            />
          );
        }
        if (message.type === 'ai') {
          return (
            <AiMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.id === lastAiMessageId}
              showApprovalButtons={index === messages.length - 1 && !approveAllTools}
              approvalCallbacks={approvalCallbacks}
              messages={messages}
            />
          );
        }
        if (message.type === 'error') {
          return (
            <ErrorMessage
              key={message.id}
              message={message}
            />
          );
        }
      })}
    </>
  );
}
