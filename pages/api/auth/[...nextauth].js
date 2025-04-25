import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
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
      return token;
    },
  },
});