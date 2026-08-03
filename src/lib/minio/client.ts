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
