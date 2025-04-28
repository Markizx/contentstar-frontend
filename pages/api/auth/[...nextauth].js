import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSecrets } from '../../../utils/getSecrets';

export default async function auth(req, res) {
  let secrets = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };

  try {
    secrets = await getSecrets();
  } catch (error) {
    console.error('Failed to load secrets from Secrets Manager, using environment variables:', error);
  }

  return await NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: secrets.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
        clientSecret: secrets.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token, user }) {
        session.user = user;
        return session;
      },
    },
    // Настройка cookie
    cookies: {
      state: {
        name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.state`,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'lax',
        },
      },
      callback: {
        name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'lax',
        },
      },
      session: {
        name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'lax',
        },
      },
    },
  });
}