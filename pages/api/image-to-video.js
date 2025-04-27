import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl } = req.body;

  try {
    const response = await axios.post(
      'https://api.runwayml.com/v1/animations',
      {
        image: imageUrl,
        effect: 'zoom-in',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const videoUrl = response.data.video_url;
    res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('Error converting image to video:', error);
    res.status(500).json({ error: 'Failed to convert image to video' });
  }
}