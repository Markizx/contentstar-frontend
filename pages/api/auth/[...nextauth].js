import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSecrets } from '../../utils/getSecrets';

if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL is not set');
}

export default NextAuth({
  providers: [
    GoogleProvider({
      async profile(profile) {
        const secrets = await getSecrets();
        const client = new MongoClient(secrets.MONGODB_URI);
        try {
          await client.connect();
          const db = client.db('contentstar_db');
          const user = await db.collection('users').findOne({ email: profile.email });

          if (!user) {
            await db.collection('users').insertOne({
              email: profile.email,
              name: profile.name,
              createdAt: new Date(),
            });
          }

          return {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
          };
        } finally {
          await client.close();
        }
      },
      clientId: null, // Loaded dynamically
      clientSecret: null, // Loaded dynamically
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const secrets = await getSecrets();
        const client = new MongoClient(secrets.MONGODB_URI);
        try {
          await client.connect();
          const db = client.db('contentstar_db');
          const user = await db.collection('users').findOne({ email: credentials.email });

          if (!user) {
            throw new Error('User not found');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return { id: user._id.toString(), email: user.email, name: user.name };
        } finally {
          await client.close();
        }
      },
    }),
  ],
  async session({ session, token }) {
    session.accessToken = token.accessToken;
    return session;
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  async beforeProviders(req) {
    const secrets = await getSecrets();
    GoogleProvider({
      clientId: secrets.GOOGLE_CLIENT_ID,
      clientSecret: secrets.GOOGLE_CLIENT_SECRET,
    });
    this.secret = secrets.NEXTAUTH_SECRET;
  },
});