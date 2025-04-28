import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSecrets } from '../../../utils/getSecrets';

export default async function auth(req, res) {
  const secrets = await getSecrets();

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
  });
}