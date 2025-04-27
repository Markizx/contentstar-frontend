import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Home({ initialLocale }) {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [userName, setUserName] = useState('User');
  const router = useRouter();
  const { locale } = router;
  const [currentLocale, setCurrentLocale] = useState(initialLocale);

  useEffect(() => {
    const effectiveLocale = locale || initialLocale;
    setCurrentLocale(effectiveLocale);
    if (effectiveLocale && i18n.language !== effectiveLocale) {
      i18n.changeLanguage(effectiveLocale);
    }
  }, [locale, initialLocale, i18n]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session, status]);

  const handleUpload = async () => {
    if (!session) return alert('Please sign in');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', 'Generate a detailed caption for this image in a professional tone');
    try {
      const res = await axios.post('http://3.25.58.70:5000/api/generate', formData);
      setResult(res.data.generatedContent);
    } catch (err) {
      console.error(err);
      setResult(t('error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-600 text-white font-inter">
      <div className="flex">
        <div className="w-64 bg-gray-900/30 backdrop-blur-lg p-6 fixed h-full">
          <h1 className="text-3xl font-poppins font-bold mb-8">{t('title')}</h1>
          <p className="mb-4">Locale: {currentLocale}</p>
          <select
            value={currentLocale}
            onChange={(e) => router.push(`/${e.target.value}`)}
            className="w-full bg-gray-800 text-white p-2 rounded-lg"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="ml-64 p-6 w-full">
          {status === 'loading' ? (
            <p className="text-center">Loading...</p>
          ) : !session ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('google')}
              className="block mx-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
            >
              {t('login')}
            </motion.button>
          ) : (
            <div className="max-w-2xl mx-auto">
              <p className="mb-4 text-xl">
                {status === 'authenticated' && userName
                  ? t('welcome', { name: userName })
                  : 'Loading user...'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg mb-4"
              >
                {t('logout')}
              </motion.button>
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg">
                <label className="block mb-2 text-lg">{t('selectFile')}</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-gray-300 bg-gray-800 rounded-lg p-2 mb-4"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                >
                  {t('upload')}
                </motion.button>
                {result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-gray-800 rounded-lg"
                  >
                    {result}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { locale: 'en' } },
      { params: { locale: 'ru' } },
      { params: { locale: 'uk' } },
      { params: { locale: 'es' } },
      { params: { locale: 'de' } },
      { params: { locale: 'fr' } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const initialLocale = params?.locale || 'en';
  return {
    props: {
      initialLocale,
    },
  };
}