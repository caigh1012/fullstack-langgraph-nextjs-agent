import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { createThread, getThreadList, updateThread, deleteThread } from '@/services/thread/thread.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 获取 Thread 列表
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  try {
    return await withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;

      const threads = await getThreadList(userId);

      return NextResponse.json<ResultVO<typeof threads>>(
        { data: threads, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
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

const threadCreateOrUpdateSchema = z.object({
  threadId: z.string(),
  title: z.string(),
});

/**
 * 创建 Thread
 * @param req
 * @returns
 */
export async function POST(req: NextRequest) {
  try {
    return withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;

      const body = await _req.json();
      const result = threadCreateOrUpdateSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json<ResultVO<null>>(
          { code: HttpBusinessCode.FAIL, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      const { threadId, title } = result.data;

      await createThread(threadId, title, userId);

      return NextResponse.json<ResultVO<null>>(
        { data: null, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
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

/**
 * 更新 Thread
 * @param req
 * @returns
 */
export async function PATCH(req: NextRequest) {
  try {
    return withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;

      const body = await _req.json();
      const result = threadCreateOrUpdateSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json<ResultVO<null>>(
          { code: HttpBusinessCode.FAIL, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      const { threadId, title } = result.data;

      await updateThread(threadId, title, userId);

      return NextResponse.json<ResultVO<null>>(
        { data: null, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
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

const threadDeleteSchema = z.object({
  threadId: z.string(),
});

/**
 * 删除 Thread
 * @param req
 * @returns
 */
export async function DELETE(req: NextRequest) {
  try {
    return withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;

      const body = await _req.json();
      const result = threadDeleteSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json<ResultVO<null>>(
          { code: HttpBusinessCode.FAIL, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      const { threadId } = result.data;

      await deleteThread(threadId, userId);

      return NextResponse.json<ResultVO<null>>(
        { data: null, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
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
