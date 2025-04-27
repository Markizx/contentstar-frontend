import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSecrets } from '../../utils/getSecrets';

export default async function handler(req, res) {
  const secrets = await getSecrets();

  return NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: secrets.GOOGLE_CLIENT_ID,
        clientSecret: secrets.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            scope: 'openid email profile',
          },
        },
      }),
    ],
    secret: secrets.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        session.user.name = session.user.name || token.name || 'User';
        session.user.email = session.user.email || token.email;
        console.log('Session callback - Token:', token);
        console.log('Session callback - Session:', session);
        return session;
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.name = user.name;
          token.email = user.email;
        }
        console.log('JWT callback - Token:', token);
        return token;
      },
      async redirect({ url, baseUrl }) {
        console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl);
        return baseUrl;
      },
      async signIn({ user, account, profile, email, credentials }) {
        console.log('SignIn callback - User:', user);
        console.log('SignIn callback - Account:', account);
        console.log('SignIn callback - Profile:', profile);
        return true;
      },
      async error({ error }) {
        console.error('NextAuth Error:', error);
        console.log('Environment variables - NEXTAUTH_SECRET:', secrets.NEXTAUTH_SECRET);
        console.log('Environment variables - NEXTAUTH_URL:', secrets.NEXTAUTH_URL);
        return { error: error.message || 'Authentication failed' };
      },
    },
    events: {
      async signIn({ user, account, profile }) {
        console.log('SignIn event - User:', user, 'Account:', account, 'Profile:', profile);
      },
      async signOut({ session, token }) {
        console.log('SignOut event - Session:', session, 'Token:', token);
      },
      async error(message) {
        console.error('Global NextAuth Error:', message);
      },
    },
  });
}