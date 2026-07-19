import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE_KEY } from './constants';

const publicRoutes = ['/login', '/register'];

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;
  const token = cookies.get(TOKEN_COOKIE_KEY)?.value;

  // 对 publicPaths 中的路径直接放行
  if (publicRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 对访问非 publicPaths 中的路径需要对 cookie 进行校验，只要存在就放行
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
