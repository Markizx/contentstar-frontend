import { getSecrets } from '../../utils/getSecrets';

export default async function handler(req, res) {
  try {
    const secrets = await getSecrets();
    res.status(200).json({
      message: 'Debug route working',
      environment: {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      },
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: 'Failed to fetch secrets' });
  }
}