import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaImage, FaUpload, FaSignOutAlt, FaSignInAlt, FaSun, FaMoon } from 'react-icons/fa';

export default function Home({ initialLocale }) {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [result, setResult] = useState('');
  const [userName, setUserName] = useState('User');
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { locale } = router;
  const [currentLocale, setCurrentLocale] = useState(initialLocale);
  const [darkMode, setDarkMode] = useState(true);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    const effectiveLocale = locale || initialLocale;
    setCurrentLocale(effectiveLocale);
    i18n.changeLanguage(effectiveLocale);
  }, [locale, initialLocale, i18n]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session, status]);

  const handleUpload = async () => {
    if (!session) {
      setError(t('pleaseSignIn'));
      return;
    }
    if (!file) {
      setError(t('fileRequired'));
      return;
    }

    console.log('File before sending:', file); // Отладка
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', 'Generate a detailed caption for this image in a professional tone');
    console.log('FormData file:', formData.get('file')); // Отладка

    try {
      const res = await axios.post(`${process.env.BACKEND_URL}/api/generate`, formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'multipart/form-data', // Явно укажем Content-Type
        },
      });
      setResult(res.data.generatedContent);
    } catch (err) {
      console.error('Error in handleUpload:', err);
      setError(err.response?.data?.error ? t(err.response.data.error) : t('contentGenerationError'));
    }
  };

  const generateImageFromText = async () => {
    if (!session) {
      setError(t('pleaseSignIn'));
      return;
    }
    if (!textPrompt) {
      setError(t('promptRequired'));
      return;
    }

    setError(null);
    try {
      const res = await axios.post(
        `${process.env.BACKEND_URL}/api/generate-image`,
        { prompt: textPrompt },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setResult(res.data.imageUrl);
    } catch (err) {
      console.error('Error in generateImageFromText:', err);
      setError(err.response?.data?.error ? t(err.response.data.error) : t('contentGenerationError'));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      const video = document.getElementById('camera');
      if (!video) {
        throw new Error('Video element not found');
      }
      video.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(t('cameraError'));
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera');
    if (!video) {
      console.error('Video element not found');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedMedia(dataUrl);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
  };

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
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
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

  const createVideoFromImage = async () => {
    if (!session) {
      setError(t('pleaseSignIn'));
      return;
    }
    if (!file) {
      setError(t('fileRequired'));
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${process.env.BACKEND_URL}/api/image-to-video`, formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data.videoUrl);
    } catch (err) {
      console.error('Error in createVideoFromImage:', err);
      setError(err.response?.data?.error ? t(err.response.data.error) : t('contentGenerationError'));
    }
  };

  const uploadCapturedMedia = async () => {
    if (!session) {
      setError(t('pleaseSignIn'));
      return;
    }
    if (!capturedMedia) {
      setError(t('mediaRequired'));
      return;
    }

    setError(null);
    try {
      const response = await fetch(capturedMedia);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, capturedMedia.includes('image') ? 'captured.png' : 'captured.webm');
      formData.append('prompt', 'Generate a detailed caption for this media in a professional tone');

      const res = await axios.post(`${process.env.BACKEND_URL}/api/generate`, formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data.generatedContent);
    } catch (err) {
      console.error('Error in uploadCapturedMedia:', err);
      setError(err.response?.data?.error ? t(err.response.data.error) : t('contentGenerationError'));
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = result.includes('video') ? 'generated-video.webm' : 'generated-image.png';
    link.click();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} font-inter transition-colors duration-300`}>
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`w-full md:w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 md:fixed md:h-full shadow-lg md:shadow-xl flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-poppins font-bold flex items-center">
                <FaImage className="mr-2" /> {t('title')}
              </h1>
              <button onClick={() => setDarkMode(!darkMode)} className="text-2xl">
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
            <p className="mb-4">{t('locale')}: {currentLocale}</p>
            <select
              value={currentLocale}
              onChange={(e) => router.push(`/${e.target.value}`)}
              className={`w-full p-2 rounded-lg shadow-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="uk">Українська</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>
          {session && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/subscribe')}
              className={`mt-4 w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
            >
              <FaUpload className="mr-2" /> {t('subscribe')}
            </motion.button>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="md:ml-64 p-6 w-full">
          {status === 'loading' ? (
            <p className="text-center">{t('loading')}</p>
          ) : !session ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('google', { callbackUrl: process.env.NEXTAUTH_URL })}
              className={`w-full md:w-auto py-3 px-6 rounded-lg shadow-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center mx-auto`}
            >
              <FaSignInAlt className="mr-2" /> {t('login')}
            </motion.button>
          ) : (
            <div className="max-w-3xl mx-auto">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-xl text-center md:text-left"
              >
                {t('welcome', { name: userName })}
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className={`w-full md:w-auto py-2 px-4 rounded-lg shadow-md ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold flex items-center justify-center mx-auto md:mx-0 mb-6`}
              >
                <FaSignOutAlt className="mr-2" /> {t('logout')}
              </motion.button>

              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

              {/* Generate Image from Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`card mb-6 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaImage className="mr-2" /> {t('generateImage')}
                </label>
                <input
                  type="text"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder={t('enterTextForImage')}
                  className={`w-full p-3 rounded-lg shadow-inner ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateImageFromText}
                  className={`mt-4 w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                >
                  <FaImage className="mr-2" /> {t('generate')}
                </motion.button>
              </motion.div>

              {/* Upload File */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`card mb-6 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaUpload className="mr-2" /> {t('selectFile')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  className={`mt-4 w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                >
                  <FaUpload className="mr-2" /> {t('upload')}
                </motion.button>
              </motion.div>

              {/* Create Video from Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`card mb-6 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaVideo className="mr-2" /> {t('createVideoFromImage')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createVideoFromImage}
                  className={`mt-4 w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                >
                  <FaVideo className="mr-2" /> {t('createVideo')}
                </motion.button>
              </motion.div>

              {/* Camera Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`card mb-6 p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaCamera className="mr-2" /> {t('captureMedia')}
                </label>
                {!cameraStream ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCamera}
                    className={`w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center mb-4`}
                  >
                    <FaCamera className="mr-2" /> {t('startCamera')}
                  </motion.button>
                ) : (
                  <>
                    <video id="camera" autoPlay className="w-full mb-4 rounded-lg shadow-md"></video>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={capturePhoto}
                        className={`w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                      >
                        <FaCamera className="mr-2" /> {t('capturePhoto')}
                      </motion.button>
                      {!recording ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startRecording}
                          className={`w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                        >
                          <FaVideo className="mr-2" /> {t('startRecording')}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopRecording}
                          className={`w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold flex items-center justify-center`}
                        >
                          <FaVideo className="mr-2" /> {t('stopRecording')}
                        </motion.button>
                      )}
                    </div>
                  </>
                )}
                {capturedMedia && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="result mt-4"
                  >
                    {capturedMedia.includes('image') ? (
                      <img src={capturedMedia} alt="Captured" className="w-full rounded-lg shadow-md" />
                    ) : (
                      <video src={capturedMedia} controls className="w-full rounded-lg shadow-md" />
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={uploadCapturedMedia}
                      className={`mt-4 w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                    >
                      <FaUpload className="mr-2" /> {t('uploadCapturedMedia')}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className={`result card p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  {result.startsWith('http') || result.startsWith('data:image') ? (
                    result.includes('video') ? (
                      <video src={result} controls className="w-full rounded-lg shadow-md" />
                    ) : (
                      <img src={result} alt="Generated" className="w-full rounded-lg shadow-md" />
                    )
                  ) : (
                    <p>{result}</p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className={`mt-4 w-full py-2 rounded-lg shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold flex items-center justify-center`}
                  >
                    <FaUpload className="mr-2" /> {t('download')}
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const initialLocale = params?.locale || 'en';
  return {
    props: {
      initialLocale,
    },
  };
}