import { MongoClient } from 'mongodb';
import { getSecrets } from '../../../lib/getsecrets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const secrets = await getSecrets();
    const client = new MongoClient(secrets.MONGODB_URI);
    await client.connect();
    const db = client.db('contentstar_db');
    const existingUser = await db.collection('users').findOne({ email });

    if (!existingUser) {
      await db.collection('users').insertOne({
        email,
        name,
        createdAt: new Date(),
      });
    }

    await client.close();
    res.status(200).json({ success: true });
  } catch (error) {
    await client.close();
    res.status(500).json({ error: 'Failed to upsert user', message: error.message });
  }
}