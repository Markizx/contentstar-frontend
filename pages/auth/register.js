import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getSecrets } from '../utils/getsecrets';

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const secrets = await getSecrets();
      const client = new MongoClient(secrets.MONGODB_URI);
      await client.connect();
      const db = client.db('contentstar_db');
      const existingUser = await db.collection('users').findOne({ email });

      if (existingUser) {
        throw new Error(t('userExists'));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.collection('users').insertOne({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
      });

      setSuccess(t('registrationSuccess'));
      router.push('/auth/signin');
    } catch (err) {
      setError(t('registrationError', { message: err.message }));
    } finally {
      setLoading(false);
      await client.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-600 text-white font-inter flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-4">{t('register')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-file w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-file w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-file w-full"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="button-upload w-full"
          >
            {loading ? t('loading') : t('register')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}