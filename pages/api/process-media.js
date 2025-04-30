import { v2 as cloudinary } from 'cloudinary';
import { getSecrets } from '../../utils/getSecrets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secrets = await getSecrets();
    cloudinary.config({
      cloud_name: secrets.CLOUDINARY_CLOUD_NAME,
      api_key: secrets.CLOUDINARY_API_KEY,
      api_secret: secrets.CLOUDINARY_API_SECRET,
    });

    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
    });
    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({ error: 'Failed to upload to Cloudinary' });
  }
}