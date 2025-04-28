import { NextResponse } from 'next/server';

export function middleware(request) {
  console.log('Middleware called for path:', request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const locales = ['en', 'ru', 'uk', 'es', 'de', 'fr'];

  const locale = pathname.split('/')[1];
  console.log('Detected locale:', locale);

  if (!locales.includes(locale)) {
    console.log('Locale not found, redirecting to /en');
    return NextResponse.redirect(new URL('/en', request.url));
  }

  console.log('Middleware proceeding with locale:', locale);
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next|favicon.ico).*)',
};