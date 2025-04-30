import { getSecrets } from '/utils/getSecrets';

export default async function handler(req, res) {
  try {
    const isLocal = process.env.NODE_ENV === 'development';
    let secrets = {};

    if (isLocal) {
      secrets = {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
        BACKEND_URL: process.env.BACKEND_URL || 'Not set',
        AWS_REGION: process.env.AWS_REGION || 'Not set',
        AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'Not set',
        SECRETS_MANAGER_SECRET_NAME: process.env.SECRETS_MANAGER_SECRET_NAME || 'Not set',
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