import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { getUserInfo } from '@/services/user/user.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取用户信息
 */
export async function GET(req: NextRequest) {
  try {
    return withAuth(req, async (_req, payload) => {
      const { sub, username } = payload;
      const user = await getUserInfo({ id: sub as string, username });
      return NextResponse.json(
        { data: user, code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS },
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
