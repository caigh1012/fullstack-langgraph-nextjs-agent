import * as Minio from 'minio';

const accessKeyId = process.env.MINIO_ACCESS_KEY_ID;
const secretAccessKey = process.env.MINIO_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error(
    'MinIO credentials are not configured. Please set both MINIO_ACCESS_KEY_ID and MINIO_SECRET_ACCESS_KEY environment variables.',
  );
}

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT as string,
  port: Number(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: accessKeyId,
  secretKey: secretAccessKey,
});

export const CHAT_BUCKET_NAME = process.env.MINIO_CHAT_BUCKET_NAME as string;

export const AVATAR_BUCKET_NAME = process.env.MINIO_AVATAR_BUCKET_NAME as string;

/**
 * 返回一个去除末尾 `/` 的对外可访问 MinIO base URL。
 *
 * 优先读取 `MINIO_PUBLIC_URL`（必须带协议，例如 `http://192.168.1.190:9000` 或 `https://minio.example.com`），
 * 这是给前端/浏览器访问对象使用的地址。
 *
 * 若未配置，则基于 `MINIO_ENDPOINT` + `MINIO_PORT` 兜底拼接为 `http://<host>:<port>`，
 * 这样在没有反向代理/HTTPS 的本地开发环境也能直接使用。
 */
export function getMinioPublicUrl(): string {
  const explicit = process.env.MINIO_PUBLIC_URL?.replace(/\/$/, '');
  if (explicit) {
    return explicit;
  }

  const endpoint = process.env.MINIO_ENDPOINT as string;
  const port = process.env.MINIO_PORT as string;
  return `http://${endpoint}:${port}`;
}

/**
 * 拼接出某个对象的可访问 URL。`key` 使用 `/` 作为分隔符，传入时不要带前导 `/`。
 */
export function buildMinioObjectUrl(bucket: string, key: string): string {
  const safeKey = key.replace(/^\/+/, '');
  return `${getMinioPublicUrl()}/${bucket}/${safeKey}`;
}
