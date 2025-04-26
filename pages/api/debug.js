import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export default function handler(req, res) {
  // Добавляем заголовки CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log('Debug route accessed at:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);

  // Проверяем наличие переменных окружения через publicRuntimeConfig
  const envVars = {
    GOOGLE_CLIENT_ID: publicRuntimeConfig.GOOGLE_CLIENT_ID || 'Not set',
    GOOGLE_CLIENT_SECRET: publicRuntimeConfig.GOOGLE_CLIENT_SECRET || 'Not set',
    NEXTAUTH_SECRET: publicRuntimeConfig.NEXTAUTH_SECRET || 'Not set',
    NEXTAUTH_URL: publicRuntimeConfig.NEXTAUTH_URL || 'Not set',
  };

  console.log('Environment variables:', envVars);

  // Проверяем, доходит ли выполнение до этого момента
  console.log('Preparing response...');

  try {
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

  console.log('After res.json - this should not be logged');
}