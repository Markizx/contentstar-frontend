import { NextResponse } from 'next/server';

const locales = ['en', 'ru', 'uk', 'es', 'de', 'fr'];
const defaultLocale = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const acceptLanguage = request.headers.get('accept-language') || 'en';
  const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
  const locale = locales.includes(preferredLocale) ? preferredLocale : defaultLocale;
  console.log('Middleware detected locale:', locale);

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};