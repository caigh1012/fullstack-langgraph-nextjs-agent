import { z } from 'zod';
import { HttpBusinessCode, HttpCode, HttpMessage } from '@/constants/http';
import { EMAIL_REGEX } from '@/constants';
import { withAuth } from '@/lib/auth/with-auth';
import { ResultVO } from '@/pojo/vo/common/result.vo';
import { getUserInfo, updateUser } from '@/services/user/user.service';
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

const updateUserSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(12, '昵称最多12个字符'),
  email: z
    .string()
    .max(255, '邮箱最多255个字符')
    .refine((value) => value === '' || EMAIL_REGEX.test(value), '邮箱格式不正确')
    .optional()
    .or(z.literal('')),
});

/**
 * 更新用户信息
 */
export async function PUT(req: NextRequest) {
  try {
    return withAuth(req, async (_req, payload) => {
      const { sub, username } = payload;
      const body = await req.json();

      const parsed = updateUserSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json<ResultVO<null>>(
          {
            code: HttpBusinessCode.FAIL,
            message: HttpMessage.PARAM_VALIDATION_ERROR,
            data: null,
          },
          { status: HttpCode.BAD_REQUEST },
        );
      }

      await updateUser({
        id: sub as string,
        username,
        ...parsed.data,
      });

      return NextResponse.json(
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
