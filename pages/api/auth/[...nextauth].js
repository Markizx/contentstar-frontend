import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSecrets } from '../../utils/getSecrets';

export default async function auth(req, res) {
  try {
    console.log('Auth route called:', req.method, req.url);

    // Проверяем, запущено ли приложение локально
    const isLocal = process.env.NODE_ENV === 'development';

    let secrets;
    if (isLocal) {
      // Локально используем переменные из .env
      secrets = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      };
      console.log('Using local environment variables:', secrets);
    } else {
      // На сервере используем Secrets Manager
      secrets = await getSecrets();
      console.log('Secrets loaded from Secrets Manager:', secrets);
    }

    // Проверяем, что все необходимые переменные присутствуют
    if (!secrets.GOOGLE_CLIENT_ID || !secrets.GOOGLE_CLIENT_SECRET || !secrets.NEXTAUTH_SECRET) {
      throw new Error('Missing required environment variables for authentication');
    }

    return NextAuth(req, res, {
      providers: [
        GoogleProvider({
          clientId: secrets.GOOGLE_CLIENT_ID,
          clientSecret: secrets.GOOGLE_CLIENT_SECRET,
        }),
      ],
      secret: secrets.NEXTAUTH_SECRET,
      callbacks: {
        async jwt({ token, account }) {
          if (account) {
            token.accessToken = account.access_token;
          }
          return token;
        },
        async session({ session, token }) {
          session.accessToken = token.accessToken;
          return session;
        },
      },
    });
  } catch (error) {
    console.error('Error in auth route:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}