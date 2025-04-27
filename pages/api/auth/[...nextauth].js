import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSecrets } from '../../utils/getSecrets'; // Убедись, что путь правильный

export default async function auth(req, res) {
  const secrets = await getSecrets();

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
}