import { NextRequest, NextResponse } from 'next/server';

import { ResultVO } from '@/pojo/vo/common/result.vo';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { AVATAR_BUCKET_NAME, buildMinioObjectUrl, minioClient } from '@/lib/minio/client';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

/**
 * 上传用户头像
 */
export async function POST(req: NextRequest) {
  try {
    return withAuth(req, async (payload) => {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      // 1. 校验 file 是否存在
      if (!file) {
        return NextResponse.json<ResultVO<null>>(
          {
            code: HttpBusinessCode.FAIL,
            message: HttpMessage.PARAM_VALIDATION_ERROR,
            data: null,
          },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      // 2. 校验文件后缀
      const fileName = file.name || '';
      const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
        return NextResponse.json<ResultVO<null>>(
          {
            code: HttpBusinessCode.FAIL,
            message: '仅支持上传图片文件',
            data: null,
          },
          { status: HttpCode.SUCCESS },
        );
      }

      // 3. 校验文件大小
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json<ResultVO<null>>(
          {
            code: HttpBusinessCode.FAIL,
            message: '文件大小不能超过 2MB',
            data: null,
          },
          { status: HttpCode.SUCCESS },
        );
      }

      // 4. 上传到 MinIO
      const buffer = Buffer.from(await file.arrayBuffer());
      const objectName = `${payload.sub}-${randomUUID()}.${extension}`;

      await minioClient.putObject(AVATAR_BUCKET_NAME, objectName, buffer, file.size, { 'Content-Type': file.type });

      return NextResponse.json<ResultVO<{ url: string }>>(
        {
          code: HttpBusinessCode.SUCCESS,
          message: HttpMessage.REQUEST_SUCCESS,
          data: {
            url: buildMinioObjectUrl(AVATAR_BUCKET_NAME, objectName),
          },
        },
        { status: HttpCode.SUCCESS },
      );
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json<ResultVO<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
