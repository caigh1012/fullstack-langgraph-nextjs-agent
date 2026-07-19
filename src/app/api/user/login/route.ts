import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TOKEN_COOKIE_KEY,
  TOKEN_EXPIRES_MS,
  TOKEN_MAX_AGE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/constants';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { userLogin } from '@/services/user/login.service';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { generateToken } from '@/utils/jwt-util';

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`)
    .max(USERNAME_MAX_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`)
    .max(PASSWORD_MAX_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`),
});

/**
 * 登录用户
 * 该层模拟 controller 层
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    // 校验参数
    if (!result.success) {
      return NextResponse.json<ResultVO<null>>(
        { code: HttpBusinessCode.SUCCESS, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
        { status: HttpCode.BAD_REQUEST },
      );
    }

    const { username, password } = result.data;

    const user = await userLogin({ username, password });

    // 用户名或密码错误
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: HttpMessage.CREDENTIALS_INVALID, code: HttpBusinessCode.SUCCESS, data: null },
        { status: HttpCode.UNAUTHORIZED },
      );
    }

    const token = generateToken({ sub: user.id.toString(), username: user.username });

    // 请求成功
    const response = NextResponse.json<ResultVO<null>>(
      { code: HttpBusinessCode.SUCCESS, message: HttpMessage.REQUEST_SUCCESS, data: null },
      { status: HttpCode.SUCCESS },
    );

    response.cookies.set({
      name: TOKEN_COOKIE_KEY,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_MAX_AGE,
      expires: new Date(Date.now() + TOKEN_EXPIRES_MS),
      path: '/',
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json<ResultVO<null>>(
      { code: HttpBusinessCode.FAIL, message: HttpMessage.INTERNAL_SERVER_ERROR, data: null },
      { status: HttpCode.INTERNAL_SERVER_ERROR },
    );
  }
}
