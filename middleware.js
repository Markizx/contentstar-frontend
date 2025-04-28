import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Если путь — корневой ("/"), перенаправляем на /en
  if (pathname === '/') {
    const redirectUrl = new URL('/en' + (search || ''), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};