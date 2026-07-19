import {
  EMAIL_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '@/constants';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { registerUser } from '@/services/user/login.service';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const registerUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`)
    .max(USERNAME_MAX_LENGTH, `用户名长度需为 ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} 位`),
  email: z
    .preprocess(
      (value) => (typeof value === 'string' ? value.trim() : value),
      z.union([z.string().regex(EMAIL_REGEX, '请输入有效邮箱'), z.literal(''), z.undefined()]),
    )
    .transform((value) => value || undefined),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`)
    .max(PASSWORD_MAX_LENGTH, `密码长度需为 ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} 位`),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']).optional().default('UNKNOWN'),
  avatarUrl: z
    .preprocess(
      (value) => (typeof value === 'string' ? value.trim() : value),
      z.union([z.string(), z.literal(''), z.null(), z.undefined()]),
    )
    .transform((value) => value || undefined),
});

/**
 * 注册用户
 * 该层模拟 controller 层
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = registerUserSchema.safeParse(body);

    // 校验参数
    if (!parsedBody.success) {
      return NextResponse.json<ResultVO<null>>(
        { code: HttpBusinessCode.SUCCESS, message: HttpMessage.PARAM_VALIDATION_ERROR, data: null },
        { status: HttpCode.BAD_REQUEST },
      );
    }

    const isSuccess = await registerUser(parsedBody.data);

    if (!isSuccess) {
      return NextResponse.json<ResultVO<null>>(
        {
          code: HttpBusinessCode.FAIL,
          message: HttpMessage.REGISTER_FAILED,
          data: null,
        },
        {
          status: HttpCode.SUCCESS,
        },
      );
    }

    // 注册成功
    return NextResponse.json<ResultVO<null>>(
      {
        code: HttpBusinessCode.SUCCESS,
        message: HttpMessage.REGISTER_SUCCESS,
        data: null,
      },
      {
        status: HttpCode.SUCCESS,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json<ResultVO<null>>(
      {
        code: HttpBusinessCode.FAIL,
        message: HttpMessage.INTERNAL_SERVER_ERROR,
        data: null,
      },
      {
        status: HttpCode.INTERNAL_SERVER_ERROR,
      },
    );
  }
}
