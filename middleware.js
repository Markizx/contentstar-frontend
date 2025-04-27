import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const locales = ['en', 'ru', 'uk', 'es', 'de', 'fr'];

  // Проверяем, начинается ли путь с локали
  const locale = pathname.split('/')[1];
  if (!locales.includes(locale)) {
    // Если локаль не указана, перенаправляем на /en
    return NextResponse.redirect(new URL('/en' + pathname, request.url));
  }

  console.log('Middleware detected locale:', locale);
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next|favicon.ico).*)',
};