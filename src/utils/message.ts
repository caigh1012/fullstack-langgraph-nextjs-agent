import { AIMessageData, MessageResponse } from '@/types/messages';

export function getMessageContent(message: MessageResponse): string {
  if (typeof message.data?.content === 'string') {
    return message.data.content;
  }
  if (Array.isArray(message.data?.content)) {
    // Extract text from content array, excluding file content (items with file_metadata)
    const textParts = message.data.content
      .filter((item: unknown) => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          // Skip items with file_metadata (these are file attachments, not user text)
          if ('file_metadata' in obj && obj.file_metadata) {
            return false;
          }
          // Include text items without file_metadata
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
  const data = message.data as AIMessageData | undefined;
  const additional = data?.additional_kwargs;
  if (!additional || typeof additional !== 'object') return '';
  const candidate = additional.reasoning_content ?? additional.reasoning ?? additional.thoughts;
  return typeof candidate === 'string' ? candidate : '';
}
