// 允许的 application/octet-stream 文件扩展名
// （浏览器通常会以这种通用 MIME 类型发送文本文件）
export const OCTET_STREAM_ALLOWED_EXTENSIONS = ['md', 'markdown', 'txt'];

/**
 * 每条消息允许的附件数量上限
 */
export const MAX_ATTACHMENTS = 3;

export const MAX_OCTET_STREAM_SIZE = 2 * 1024 * 1024; // 2MB

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
