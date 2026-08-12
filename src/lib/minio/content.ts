import { FileAttachment } from '@/types/messages';
import { ContentBlock } from 'langchain';
import { getFile } from './upload';

export async function downloadFileAsBase64(key: string): Promise<string> {
  const buffer = await getFile(key);
  return buffer.toString('base64');
}

export async function getFileDataUrl(attachment: FileAttachment): Promise<string> {
  const base64 = await downloadFileAsBase64(attachment.key);
  return `data:${attachment.type};base64,${base64}`;
}

interface FileMetadata {
  url: string;
  key: string;
  name: string;
  type: string;
  size: number;
}

export type ProcessedAttachment = ContentBlock & { file_metadata?: FileMetadata };

export async function processAttachmentsForAI(attachments: FileAttachment[]): Promise<Array<ProcessedAttachment>> {
  const contentItems: Array<ProcessedAttachment> = [];

  for (const attachment of attachments) {
    // const extension = attachment.name.split('.').pop()?.toLowerCase() || '';
    if (attachment.type.startsWith('image/')) {
      // 图片转成了 base 64
      const dataUrl = await getFileDataUrl(attachment);
      contentItems.push({
        type: 'image',
        source_type: 'base64',
        mime_type: attachment.type,
        data: dataUrl,
        file_metadata: {
          url: attachment.url,
          key: attachment.key,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
        },
      });
    }
    try {
    } catch (error) {
      console.error(`Failed to process attachment ${attachment.name}:`, error);
      throw new Error(`Failed to process attachment ${attachment.name}`);
    }
  }
  return contentItems;
}
