import type { Readable } from 'node:stream';
import { buildMinioObjectUrl, CHAT_BUCKET_NAME, minioClient } from '@/lib/minio/client';

/**
 * 大文件阈值：超过该字节数（5MB）的文件将自动走 `uploadLargeFile` 分片上传。
 */
export const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

/**
 * 分片上传的最小分片大小（与 S3/MinIO 的 5MB 最小 Part 限制保持一致）。
 */
const MIN_PART_SIZE = 5 * 1024 * 1024;

/**
 * 分片上传的默认分片大小（10MB）。
 */
const DEFAULT_PART_SIZE = 10 * 1024 * 1024;

/**
 * 分片上传的最大并发数。
 */
const PART_CONCURRENCY = 4;

export interface UploadFileOptions {
  bucket: string;
  key: string;
  file: File | Buffer;
  contentType?: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * 将传入的 `File` 或 `Buffer` 统一转换为 `Buffer`，便于后续处理。
 */
async function toBuffer(input: File | Buffer): Promise<Buffer> {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  return Buffer.from(await input.arrayBuffer());
}

/**
 * 将 MinIO 返回的可读流聚合为 `Buffer`。
 */
async function readStreamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * 计算分片上传时每个分片的大小，保证不低于 MinIO 允许的最小值。
 */
function getPartSize(fileSize: number): number {
  // 至少分 1 片，上限按默认分片大小计算
  const partSize = Math.max(MIN_PART_SIZE, DEFAULT_PART_SIZE);
  // 简单文件不会走到这里，此处保留对超大文件的兜底
  if (fileSize <= partSize) {
    return Math.max(MIN_PART_SIZE, fileSize);
  }
  return partSize;
}

/**
 * 上传文件到 MinIO。
 *
 * 当文件大小超过 `LARGE_FILE_THRESHOLD`（5MB）时，自动走 `uploadLargeFile` 分片上传；
 * 否则走 `putObject` 单次上传。
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadResult> {
  const { file } = options;
  const buffer = await toBuffer(file);

  if (buffer.length > LARGE_FILE_THRESHOLD) {
    return uploadLargeFile({ ...options, file: buffer });
  }

  return uploadSmallFile({ ...options, file: buffer });
}

/**
 * 小文件上传（≤ 5MB），使用 `putObject` 一次完成。
 */
async function uploadSmallFile(options: UploadFileOptions): Promise<UploadResult> {
  const { bucket, key, file, contentType } = options;
  const buffer = await toBuffer(file);

  await minioClient.putObject(bucket, key, buffer, buffer.length, {
    'Content-Type': contentType ?? 'application/octet-stream',
  });

  return {
    key,
    url: buildMinioObjectUrl(bucket, key),
  };
}

/**
 * 大文件上传（> 5MB），使用分片上传（multipart upload）。
 *
 * 流程：
 *  1. `initiateNewMultipartUpload` 初始化分片任务，获取 `uploadId`；
 *  2. 将文件按分片大小切片，并发调用 `uploadPart` 上传每个分片（受并发数限制）；
 *  3. 全部成功后调用 `completeMultipartUpload` 合并分片；
 *  4. 任一分片失败时调用 `abortMultipartUpload` 中断任务，避免残留脏数据。
 */
export async function uploadLargeFile(options: UploadFileOptions): Promise<UploadResult> {
  const { bucket, key, file, contentType } = options;
  const buffer = await toBuffer(file);
  const partSize = getPartSize(buffer.length);
  const partCount = Math.ceil(buffer.length / partSize);

  const headers: Record<string, string | number | boolean | undefined> = {
    'Content-Type': contentType ?? 'application/octet-stream',
  };

  const uploadId = await minioClient.initiateNewMultipartUpload(bucket, key, headers);

  // 使用对象数组按 partNumber 顺序收集结果，避免并发下乱序
  const parts: { part: number; etag?: string }[] = new Array(partCount);

  try {
    let nextPartNumber = 1;
    const workers: Promise<void>[] = [];

    const uploadOnePart = async (partNumber: number): Promise<void> => {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, buffer.length);
      const partBuffer = buffer.subarray(start, end);

      const partInfo = await minioClient.uploadPart(
        {
          bucketName: bucket,
          objectName: key,
          uploadID: uploadId,
          partNumber,
          headers: {},
        },
        partBuffer,
      );

      parts[partNumber - 1] = { part: partNumber, etag: partInfo.etag };
    };

    while (nextPartNumber <= partCount) {
      while (workers.length < PART_CONCURRENCY && nextPartNumber <= partCount) {
        const partNumber = nextPartNumber++;
        workers.push(uploadOnePart(partNumber));
      }
      if (workers.length >= PART_CONCURRENCY) {
        await Promise.all(workers.splice(0, workers.length));
      }
    }
    await Promise.all(workers);

    await minioClient.completeMultipartUpload(bucket, key, uploadId, parts);
  } catch (error) {
    // 任意分片失败时，中断分片任务，避免 MinIO 残留未完成的上传
    await minioClient.abortMultipartUpload(bucket, key, uploadId).catch(() => {
      // 静默 abort 失败，不掩盖原始错误
    });
    throw error;
  }

  return {
    key,
    url: buildMinioObjectUrl(bucket, key),
  };
}

/**
 * 从 MinIO 下载文件。
 */
export async function getFile(key: string): Promise<Buffer> {
  const stream = await minioClient.getObject(CHAT_BUCKET_NAME, key);
  return readStreamToBuffer(stream);
}
