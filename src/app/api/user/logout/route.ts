import { NextRequest, NextResponse } from 'next/server';

import { TOKEN_COOKIE_KEY } from '@/constants';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { withAuth } from '@/lib/auth/with-auth';

/**
 * 退出登录用户
 * 该层模拟 controller 层
 */
export async function POST(req: NextRequest) {
  try {
    return withAuth(req, async () => {
      const response = NextResponse.json<ResultVO<null>>(
        {
          message: HttpMessage.LOGOUT_SUCCESS,
          data: null,
          code: HttpBusinessCode.SUCCESS,
        },
        {
          status: HttpCode.SUCCESS,
        },
      );

      response.cookies.delete({
        name: TOKEN_COOKIE_KEY,
      });

      return response;
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json<ResultVO<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
