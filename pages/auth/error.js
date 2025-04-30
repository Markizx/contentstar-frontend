import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function AuthError() {
  const { t } = useTranslation();
  const router = useRouter();
  const { error } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-600 text-white font-inter flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold mb-4">{t('authError')}</h1>
        <p>{t('authErrorMessage', { error: error || 'Unknown error' })}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="button-upload mt-4"
        >
          {t('goHome')}
        </motion.button>
      </motion.div>
    </div>
  );
}