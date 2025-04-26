export default function handler(req, res) {
    // Добавляем заголовки CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    console.log('Debug route accessed at:', new Date().toISOString());
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
  
    // Проверяем наличие переменных окружения
    const envVars = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    };
  
    console.log('Environment variables:', envVars);
  
    try {
      res.status(200).json({
        message: 'Debug route working',
        environment: envVars,
      });
    } catch (error) {
      console.error('Error in /api/debug:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }