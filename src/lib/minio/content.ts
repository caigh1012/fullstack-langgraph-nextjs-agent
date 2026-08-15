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

export async function preparePdfForAI(attachment: FileAttachment): Promise<string> {
  const base64 = await downloadFileAsBase64(attachment.key);
  return `data:application/pdf;base64,${base64}`;
}

export async function extractTextContent(key: string): Promise<string> {
  const buffer = await getFile(key);
  return buffer.toString('utf-8');
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
    try {
      const extension = attachment.name.split('.').pop()?.toLowerCase() || '';
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
      // 处理 pdf 文件
      else if (attachment.type === 'application/pdf') {
        // pdf也转成 base 64
        const dataUrl = await preparePdfForAI(attachment);
        contentItems.push({
          type: 'file',
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
      } else if (
        attachment.type.startsWith('text/') ||
        (attachment.type === 'application/octet-stream' && ['md', 'markdown', 'txt'].includes(extension))
      ) {
        // 文本文件直接读取内容
        const textContent = await extractTextContent(attachment.key);
        contentItems.push({
          type: 'text',
          text: `\n\n[Content of ${attachment.name}]:\n${textContent}`,
          file_metadata: {
            url: attachment.url,
            key: attachment.key,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to process attachment ${attachment.name}:`, error);
      throw new Error(`Failed to process attachment ${attachment.name}`);
    }
  }
  return contentItems;
}
