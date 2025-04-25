import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

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
      console.log('Updating userName to:', session.user.name);
      setUserName(session.user.name);
    }
  }, [session, status]);

  const handleUpload = async () => {
    if (!session) return alert('Please sign in');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/generate', formData);
      setResult(res.data.generatedContent);
    } catch (err) {
      console.error(err);
      setResult(t('error'));
    }
  };

  console.log('Current locale:', locale, 'Initial locale:', initialLocale);
  console.log('Session status:', status, 'Session data:', session);
  console.log('Translated welcome:', t('welcome', { name: userName }));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p>Current locale: {currentLocale}</p>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : !session ? (
        <button
          onClick={() => signIn('google')}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          {t('login')}
        </button>
      ) : (
        <div>
          <p className="mt-4">
  {status === 'authenticated' && userName
    ? `Hello, ${userName}!`
    : 'Loading user...'}
</p>
          <button
            onClick={() => signOut()}
            className="mt-2 bg-red-500 text-white p-2 rounded"
          >
            {t('logout')}
          </button>
          <div className="my-4">
            <label className="block mb-2">{t('selectFile')}</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="block"
            />
          </div>
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {t('upload')}
          </button>
          {result && <p className="mt-4">{result}</p>}
        </div>
      )}
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