import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaGoogle } from 'react-icons/fa';

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      router.push('/');
    } catch (err) {
      setError(t('signInError', { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: process.env.NEXTAUTH_URL });
    } catch (err) {
      setError(t('googleSignInError'));
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
        <h1 className="text-2xl font-bold mb-4">{t('signIn')}</h1>
        <form onSubmit={handleCredentialsSubmit}>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="button-upload w-full mb-4"
          >
            <FaSignInAlt className="mr-2" /> {loading ? t('loading') : t('signIn')}
          </motion.button>
        </form>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleSignIn}
          className="button-login w-full"
        >
          <FaGoogle className="mr-2" /> {t('signInWithGoogle')}
        </motion.button>
      </motion.div>
    </div>
  );
}