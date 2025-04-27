import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Home({ initialLocale }) {
  console.log('Rendering pages/[locale]/index.js with initialLocale:', initialLocale);

  const { t, i18n } = useTranslation();
  console.log('useTranslation:', t, i18n);

  const { data: session, status } = useSession();
  console.log('useSession:', { session, status });

  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [userName, setUserName] = useState('User');
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const router = useRouter();
  const { locale } = router;
  const [currentLocale, setCurrentLocale] = useState(initialLocale);

  useEffect(() => {
    const effectiveLocale = locale || initialLocale;
    console.log('Locale:', effectiveLocale);
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

  // Функция для загрузки файла и генерации текста
  const handleUpload = async () => {
    if (!session) return alert('Please sign in');
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', 'Generate a detailed caption for this image in a professional tone');
    try {
      const res = await axios.post('http://3.25.58.70:5000/api/generate', formData);
      setResult(res.data.generatedContent);
    } catch (err) {
      console.error('Error in handleUpload:', err);
      setResult(t('error'));
    }
  };

  // Функция для генерации изображения из текста
  const generateImageFromText = async (text) => {
    if (!session) return alert('Please sign in');
    if (!text) return alert('Please enter text to generate an image');
    try {
      const res = await axios.post('http://3.25.58.70:5000/api/generate-image', { prompt: text });
      setResult(res.data.imageUrl);
    } catch (err) {
      console.error('Error in generateImageFromText:', err);
      setResult(t('error'));
    }
  };

  // Функция для доступа к камере
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      const video = document.getElementById('camera');
      video.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access the camera');
    }
  };

  // Функция для захвата фото
  const capturePhoto = () => {
    const video = document.getElementById('camera');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedMedia(dataUrl);
    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
  };

  // Функция для захвата видео
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = () => {
    if (!cameraStream) return;
    const recorder = new MediaRecorder(cameraStream);
    setMediaRecorder(recorder);
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setCapturedMedia(url);
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // Функция для создания видео из изображения
  const createVideoFromImage = async () => {
    if (!session) return alert('Please sign in');
    if (!file) return alert('Please select an image');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axios.post('http://3.25.58.70:5000/api/image-to-video', formData);
      setResult(res.data.videoUrl);
    } catch (err) {
      console.error('Error in createVideoFromImage:', err);
      setResult(t('error'));
    }
  };

  console.log('Rendering Home component:', { status, session });

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

              {/* Секция для генерации изображения из текста */}
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4">
                <label className="block mb-2 text-lg">{t('generateImage')}</label>
                <input
                  type="text"
                  placeholder={t('enterTextForImage')}
                  onChange={(e) => setResult(e.target.value)}
                  className="block w-full text-gray-300 bg-gray-800 rounded-lg p-2 mb-4"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generateImageFromText(result)}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                >
                  {t('generate')}
                </motion.button>
              </div>

              {/* Секция для загрузки файла и генерации текста */}
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4">
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
              </div>

              {/* Секция для создания видео из изображения */}
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4">
                <label className="block mb-2 text-lg">{t('createVideoFromImage')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-gray-300 bg-gray-800 rounded-lg p-2 mb-4"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createVideoFromImage}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                >
                  {t('createVideo')}
                </motion.button>
              </div>

              {/* Секция для работы с камерой */}
              <div className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4">
                <label className="block mb-2 text-lg">{t('captureMedia')}</label>
                {!cameraStream ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCamera}
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg mb-4"
                  >
                    {t('startCamera')}
                  </motion.button>
                ) : (
                  <>
                    <video id="camera" autoPlay className="w-full mb-4"></video>
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={capturePhoto}
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                      >
                        {t('capturePhoto')}
                      </motion.button>
                      {!recording ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startRecording}
                          className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                        >
                          {t('startRecording')}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopRecording}
                          className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg"
                        >
                          {t('stopRecording')}
                        </motion.button>
                      )}
                    </div>
                  </>
                )}
                {capturedMedia && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-gray-800 rounded-lg"
                  >
                    {capturedMedia.includes('image') ? (
                      <img src={capturedMedia} alt="Captured" className="w-full" />
                    ) : (
                      <video src={capturedMedia} controls className="w-full" />
                    )}
                  </motion.div>
                )}
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-gray-800 rounded-lg"
                >
                  {result.startsWith('http') ? (
                    result.includes('video') ? (
                      <video src={result} controls className="w-full" />
                    ) : (
                      <img src={result} alt="Generated" className="w-full" />
                    )
                  ) : (
                    <p>{result}</p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  console.log('getStaticPaths called');
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
  console.log('getStaticProps called with params:', params);
  const initialLocale = params?.locale || 'en';
  return {
    props: {
      initialLocale,
    },
  };
}