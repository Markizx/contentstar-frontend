import { getSecrets } from '../../utils/getSecrets';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('Debug route accessed at:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);

  try {
    const secrets = await getSecrets();
    const envVars = {
      GOOGLE_CLIENT_ID: secrets.GOOGLE_CLIENT_ID || 'Not set',
      GOOGLE_CLIENT_SECRET: secrets.GOOGLE_CLIENT_SECRET || 'Not set',
      NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET || 'Not set',
      NEXTAUTH_URL: secrets.NEXTAUTH_URL || 'Not set',
    };

    console.log('Environment variables:', envVars);

    console.log('Preparing response...');
    const response = {
      message: 'Debug route working',
      environment: envVars,
    };
    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/debug:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}