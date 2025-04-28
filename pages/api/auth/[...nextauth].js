import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Убедимся, что NEXTAUTH_URL всегда используется
if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL is not set');
}

export default async function auth(req, res) {
  // Отладка: выведем NEXTAUTH_URL
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

  return NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            // Явно задаём redirect_uri на основе NEXTAUTH_URL
            redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
          },
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async redirect({ url, baseUrl }) {
        console.log('Redirect URL:', url);
        console.log('Base URL:', baseUrl);
        // Используем NEXTAUTH_URL вместо baseUrl
        return process.env.NEXTAUTH_URL;
      },
    },
  });
}