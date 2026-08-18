import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { CHAT_BUCKET_NAME } from '@/lib/minio/client';
import { uploadFile } from '@/lib/minio/upload';
import { Result } from '@/types/common/result';
import { isValidTextContent, validateFile } from '@/lib/minio/validation';
import { OCTET_STREAM_ALLOWED_EXTENSIONS } from '@/constants/upload';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 上传聊天附件到 MinIO，返回可访问的 URL 用于前端回显与提交
 */
export async function POST(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      // 1. 校验 file 是否存在
      if (!file) {
        return NextResponse.json<Result<null>>(
          {
            code: HttpBusinessCode.FAIL,
            message: HttpMessage.PARAM_VALIDATION_ERROR,
            data: null,
          },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      // 2. 校验文件
      const validationError = validateFile(file);
      if (validationError) {
        return NextResponse.json(
          {
            data: null,
            code: HttpBusinessCode.FAIL,
            message: validationError.message,
          },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 为 application/octet-stream 文件添加额外验证
      // TODO：在生产环境中启用内容检查以提升安全性
      if (file.type === 'application/octet-stream') {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (OCTET_STREAM_ALLOWED_EXTENSIONS.includes(extension)) {
          if (!isValidTextContent(buffer)) {
            return NextResponse.json<Result<null>>(
              {
                data: null,
                code: HttpBusinessCode.FAIL,
                message: '文件似乎是二进制文件，而非文本',
              },
              { status: HttpCode.BAD_REQUEST },
            );
          }
        }
      }

      const extension = file.name.split('.').pop() || 'bin';

      // 3. 上传到 MinIO（> 5MB 自动走分片上传）
      const objectName = `${payload.sub}-${randomUUID()}${extension ? `.${extension}` : ''}`;

      const { key, url } = await uploadFile({
        bucket: CHAT_BUCKET_NAME,
        key: objectName,
        file,
        contentType: file.type,
      });

      return NextResponse.json<Result<{ url: string; key: string }>>(
        {
          code: HttpBusinessCode.SUCCESS,
          message: HttpMessage.REQUEST_SUCCESS,
          data: { key, url },
        },
        { status: HttpCode.SUCCESS },
      );
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json<Result<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
