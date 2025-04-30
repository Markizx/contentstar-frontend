import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Home() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !prompt) {
      alert(t('fileAndPromptRequired'));
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.generatedContent);
      } else {
        alert(t('contentGenerationFailed', { error: data.error }));
      }
    } catch (error) {
      alert(t('contentGenerationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-600 text-white font-inter">
      <div className="container mx-auto p-6">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-6"
        >
          {t('welcome', { name: session?.user?.name || 'Guest' })}
        </motion.h1>
        {session ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block mb-2">{t('uploadFile')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input-file w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('prompt')}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input-file w-full"
                rows="4"
              ></textarea>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="button-upload w-full"
            >
              {loading ? t('loading') : t('generateContent')}
            </motion.button>
          </form>
        ) : (
          <p>{t('pleaseSignIn')}</p>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gray-800 rounded-lg"
          >
            <h2 className="text-xl font-bold mb-2">{t('generatedContent')}</h2>
            <p>{result}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function getServerSideProps({ params }) {
  const initialLocale = params?.locale || 'en';
  return {
    props: {
      initialLocale,
    },
  };
}