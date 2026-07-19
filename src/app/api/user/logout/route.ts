import { NextResponse } from 'next/server';

import { TOKEN_COOKIE_KEY } from '@/constants';

/**
 * 退出登录用户
 * 该层模拟 controller 层
 */
export async function POST() {
  const response = NextResponse.json({
    message: '退出登录成功',
  });

  response.cookies.set({
    name: TOKEN_COOKIE_KEY,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
