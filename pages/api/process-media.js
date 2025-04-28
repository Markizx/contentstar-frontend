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

     try {
       const { file } = req.body;
       const result = await cloudinary.uploader.upload(file);
       return res.status(200).json({ url: result.secure_url });
     } catch (error) {
       console.error('Error uploading to Cloudinary:', error);
       return res.status(500).json({ error: 'Failed to upload to Cloudinary' });
     }
   }