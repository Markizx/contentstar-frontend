import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Определяем baseUrl в зависимости от окружения
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export default async function auth(req, res) {
  // Отладка: выведем NEXTAUTH_URL и baseUrl
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
  console.log('Base URL:', baseUrl);

  return NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            // Явно задаём redirect_uri
            redirect_uri: `${baseUrl}/api/auth/callback/google`,
          },
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async redirect({ url, baseUrl }) {
        console.log('Redirect URL:', url);
        console.log('Base URL:', baseUrl);
        // Убедимся, что redirect всегда использует правильный baseUrl
        return baseUrl;
      },
    },
    // Явно задаём baseUrl для next-auth
    baseUrl: baseUrl,
  });
}