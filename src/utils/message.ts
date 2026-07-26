import { MessageResponse } from '@/types/messages';

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
