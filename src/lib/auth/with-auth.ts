import { TOKEN_COOKIE_KEY } from '@/constants';
import { HttpCode } from '@/constants/http';
import { HttpBusinessCode, HttpMessage } from '@/constants/http';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { verifyToken } from '@/utils/jwt-util';
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const withAuth = async (
  req: NextRequest,
  handler: (req: NextRequest, payload: JwtPayload) => Promise<Response>,
) => {
  try {
    // token 在这里一定会存在，若不存在会被 proxy 拦截
    const token = req.cookies.get(TOKEN_COOKIE_KEY)?.value as string;
    const payload = verifyToken(token) as JwtPayload;

    // 若 payload 不存在，返回 401
    if (!payload) {
      return NextResponse.json<ResultVO<null>>(
        { code: HttpBusinessCode.FAIL, message: HttpMessage.TOKEN_INVALID, data: null },
        { status: HttpCode.UNAUTHORIZED },
      );
    }

    // 2. 验证通过，执行真正的处理函数
    return await handler(req, payload);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return NextResponse.json<ResultVO<null>>(
        { code: HttpBusinessCode.FAIL, message: HttpMessage.TOKEN_EXPIRED, data: null },
        { status: HttpCode.UNAUTHORIZED },
      );
    }

    if (error instanceof JsonWebTokenError) {
      return NextResponse.json<ResultVO<null>>(
        { code: HttpBusinessCode.FAIL, message: HttpMessage.TOKEN_INVALID, data: null },
        { status: HttpCode.UNAUTHORIZED },
      );
    }

    throw error;
  }
};
