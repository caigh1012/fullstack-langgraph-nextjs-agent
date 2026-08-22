import { MessageResponse, ToolCall } from '@/types/vo/message.vo';
/**
 * 从消息响应体中提取消息内容
 */
export function getMessageContent(message: MessageResponse): string {
  // 如果 content 是字符串，直接返回
  if (typeof message.content === 'string') {
    return message.content;
  }
  // 如果 content 是数组，提取文本
  if (Array.isArray(message.content)) {
    // 从内容数组中提取文本，排除文件内容（即包含 file_metadata 的条目）
    const textParts = message.content
      .filter((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          // 跳过带有 file_metadata 的项目（这些是文件附件，不是用户文本）
          if ('file_metadata' in obj && obj.file_metadata) {
            return false;
          }
          // 包含无文件元数据的文本项
          return 'text' in obj && typeof obj.text === 'string';
        }
        return typeof item === 'string';
      })
      .map((item: unknown) => {
        if (typeof item === 'string') {
          return item;
        }
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          return typeof obj.text === 'string' ? obj.text : '';
        }
        return '';
      });
    return textParts.join('');
  }
  return '';
}

/**
 * 从 AI 消息的 additional_kwargs 中提取推理（Reasoning）内容
 * 兼容 reasoning_content / reasoning / thoughts 等常见字段
 */
export function getMessageReasoning(message: MessageResponse): string {
  const additional = message?.additional_kwargs;
  if (!additional || typeof additional !== 'object') return '';
  const candidate = additional.reasoning_content ?? additional.reasoning ?? additional.thoughts;
  return typeof candidate === 'string' ? candidate : '';
}

export interface ToolApprovalCallbacks {
  onApprove: (toolCallId: string) => void;
  onDeny: (toolCallId: string) => void;
}

/**
 * 提取 AI 消息中的工具调用列表
 */
export function getToolCalls(message: MessageResponse): ToolCall[] {
  if (message.type !== 'ai' || !Array.isArray(message.tool_calls)) {
    return [];
  }
  return message.tool_calls;
}

/**
 * 判断消息是否包含尚未执行的工具调用
 */
export function hasPendingToolCalls(message: MessageResponse): boolean {
  return getToolCalls(message).length > 0;
}

/**
 * 从消息列表中匹配工具调用的执行结果
 */
export function getToolResult(toolCallId: string, messages: MessageResponse[]): { content: string } | null {
  for (const msg of messages) {
    if (msg.type !== 'tool') continue;
    const toolMessage = msg as MessageResponse & { tool_call_id?: string };
    if (toolMessage.tool_call_id === toolCallId) {
      const content = typeof msg.content === 'string' ? msg.content : '';
      return { content };
    }
  }
  return null;
}
