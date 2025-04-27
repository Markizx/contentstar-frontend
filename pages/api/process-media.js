import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { file, effect } = req.body;

  try {
    const result = await cloudinary.uploader.upload(file, {
      transformation: [{ effect }],
    });
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Error processing media:', error);
    res.status(500).json({ error: 'Failed to process media' });
  }
}