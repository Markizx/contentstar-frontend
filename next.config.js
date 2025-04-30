/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  env: {
    SECRETS_MANAGER_SECRET_NAME: process.env.SECRETS_MANAGER_SECRET_NAME,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
  },
  images: {
    domains: ['contentstar-files.s3.ap-southeast-2.amazonaws.com'],
  },
  i18n: {
    locales: ['en', 'ru', 'uk', 'es', 'de', 'fr'],
    defaultLocale: 'en',
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000'; // Fallback URL
    if (!backendUrl) {
      throw new Error('BACKEND_URL is not defined in environment variables');
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;