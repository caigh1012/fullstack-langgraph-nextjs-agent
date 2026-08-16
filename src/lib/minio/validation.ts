// 允许的 application/octet-stream 文件扩展名
// （浏览器通常会以这种通用 MIME 类型发送文本文件）
const OCTET_STREAM_ALLOWED_EXTENSIONS = ['md', 'markdown', 'txt'];

const MAX_OCTET_STREAM_SIZE = 2 * 1024 * 1024; // 2MB

// 每条消息允许的附件数量上限
export const MAX_ATTACHMENTS = 3;

export const ALLOWED_MIME_TYPES = {
  // Images
  'image/png': { ext: 'png', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/jpeg': { ext: 'jpg', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/jpg': { ext: 'jpg', maxSize: 5 * 1024 * 1024 }, // 5MB
  // Documents
  'application/pdf': { ext: 'pdf', maxSize: 10 * 1024 * 1024 }, // 10MB
  // Text
  'text/markdown': { ext: 'md', maxSize: 2 * 1024 * 1024 }, // 2MB
  'text/plain': { ext: 'txt', maxSize: 2 * 1024 * 1024 }, // 2MB
} as const;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFile(file: File): ValidationError | null {
  // 对 application/octet-stream 的特殊处理
  // （浏览器通常会使用此类型来处理扩展名未被识别的文本文件）
  if (file.type === 'application/octet-stream') {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    // 仅允许特定的文本文件扩展名用于 octet-stream
    if (!OCTET_STREAM_ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        field: 'name',
        message: `File extension ${extension} is not allowed for application/octet-stream. Allowed extensions: ${OCTET_STREAM_ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }
    // 为 octet-stream 下的文本文件设置大小限制
    if (file.size > MAX_OCTET_STREAM_SIZE) {
      return {
        field: 'size',
        message: `File size exceeds maximum allowed size of ${MAX_OCTET_STREAM_SIZE / (1024 * 1024)}MB for text files`,
      };
    }
  }

  // 检查文件类型是否被允许
  if (!(file.type in ALLOWED_MIME_TYPES)) {
    return {
      field: 'type',
      message: `File type ${file.type} is not allowed. Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
    };
  }

  // 检查文件大小
  const { maxSize } = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES];
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      field: 'size',
      message: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isValidTextContent(_buffer: Buffer): boolean {
  // 目前接受所有内容——后续可添加验证
  return true;
}
