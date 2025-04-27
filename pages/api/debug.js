import { getSecrets } from '/utils/getSecrets';

export default async function handler(req, res) {
  try {
    const isLocal = process.env.NODE_ENV === 'development';
    let secrets;

    if (isLocal) {
      secrets = {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'Not set',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      };
    } else {
      secrets = await getSecrets();
    }

    res.status(200).json({
      message: 'Debug route working',
      environment: secrets,
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: 'Failed to fetch secrets', details: error.message });
  }
}