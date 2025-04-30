import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoClient } from 'mongodb';
import { getSecrets } from '../../utils/getsecrets.js';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const secrets = await getSecrets();
        const client = new MongoClient(secrets.MONGODB_URI);
        await client.connect();
        const db = client.db('contentstar_db');
        const existingUser = await db.collection('users').findOne({ email: user.email });

        if (!existingUser) {
          await db.collection('users').insertOne({
            email: user.email,
            name: user.name,
            createdAt: new Date(),
          });
        }

        await client.close();
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      session.user.name = token.name;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});