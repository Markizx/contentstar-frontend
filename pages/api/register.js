import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getSecrets } from '../../lib/getsecrets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const secrets = await getSecrets();
    const client = new MongoClient(secrets.MONGODB_URI);
    await client.connect();
    const db = client.db('contentstar_db');
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      await client.close();
      return res.status(400).json({ error: 'userExists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    });

    await client.close();
    res.status(200).json({ message: 'registrationSuccess' });
  } catch (err) {
    await client.close();
    res.status(500).json({ error: 'registrationError', message: err.message });
  }
}