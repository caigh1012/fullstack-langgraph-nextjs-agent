import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { fetchThreadHistory } from '@/services/message/message.service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * 获取 Thread 消息历史
 * @param req
 * @returns
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    return await withAuth(req, async (_req, payload) => {
      const userId = payload.sub as string;

      const { threadId } = await params;

      const messages = await fetchThreadHistory(userId, threadId);

      return NextResponse.json<ResultVO<typeof messages>>(
        { data: messages, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
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
