import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('jwt')?.value;

  if (!token) {
    const loginUrl = new URL('/user/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
