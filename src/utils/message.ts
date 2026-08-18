import { AIMessageData, MessageResponse } from '@/types/vo/message.vo';

/**
 * 从消息响应体中提取消息内容
 */
export function getMessageContent(message: MessageResponse): string {
  if (typeof message.data?.content === 'string') {
    return message.data.content;
  }
  if (Array.isArray(message.data?.content)) {
    // 从内容数组中提取文本，排除文件内容（即包含 file_metadata 的条目）
    const textParts = message.data.content
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
  const data = message.data as AIMessageData | undefined;
  const additional = data?.additional_kwargs;
  if (!additional || typeof additional !== 'object') return '';
  const candidate = additional.reasoning_content ?? additional.reasoning ?? additional.thoughts;
  return typeof candidate === 'string' ? candidate : '';
}
