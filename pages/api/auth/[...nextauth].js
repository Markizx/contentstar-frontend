import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getSecrets = async () => {
  try {
    const command = new GetSecretValueCommand({
      SecretId: 'contentstar-secrets',
    });
    const response = await client.send(command);
    return JSON.parse(response.SecretString);
  } catch (err) {
    console.error('Error retrieving secrets:', err);
    return {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };
  }
};

export default async function auth(req, res) {
  const secrets = await getSecrets();
  
  // Отладка: выведем NEXTAUTH_URL и baseUrl
  console.log('NEXTAUTH_URL:', secrets.NEXTAUTH_URL);
  console.log('Base URL for redirect:', secrets.NEXTAUTH_URL || 'http://localhost:3000');

  return NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: secrets.GOOGLE_CLIENT_ID,
        clientSecret: secrets.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            redirect_uri: `${secrets.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
          },
        },
      }),
    ],
    secret: secrets.NEXTAUTH_SECRET,
    callbacks: {
      async redirect({ url, baseUrl }) {
        console.log('Redirect URL:', url);
        console.log('Base URL:', baseUrl);
        return baseUrl;
      },
    },
  });
}