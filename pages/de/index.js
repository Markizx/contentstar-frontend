import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaImage, FaUpload, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [userName, setUserName] = useState('User');
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState('de');

  useEffect(() => {
    i18n.changeLanguage('de');
    setCurrentLocale('de');
  }, [i18n]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session, status]);

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

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = result.includes('video') ? 'generated-video.webm' : 'generated-image.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue to-blue-600 text-white font-inter">
      <div className="flex">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-gray-900/30 backdrop-blur-lg p-6 fixed h-full shadow-xl"
        >
          <h1 className="text-3xl font-poppins font-bold mb-8 flex items-center">
            <FaImage className="mr-2" /> {t('title')}
          </h1>
          <p className="mb-4">Locale: {currentLocale}</p>
          <select
            value={currentLocale}
            onChange={(e) => router.push(`/${e.target.value}`)}
            className="w-full bg-gray-800 text-white p-2 rounded-lg shadow-md"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </motion.div>

        <div className="ml-64 p-6 w-full">
          {status === 'loading' ? (
            <p className="text-center">Loading...</p>
          ) : !session ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('google')}
              className="block mx-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center"
            >
              <FaSignInAlt className="mr-2" /> {t('login')}
            </motion.button>
          ) : (
            <div className="max-w-2xl mx-auto">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-xl"
              >
                {status === 'authenticated' && userName
                  ? t('welcome', { name: userName })
                  : 'Loading user...'}
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg mb-4 flex items-center justify-center"
              >
                <FaSignOutAlt className="mr-2" /> {t('logout')}
              </motion.button>

              {/* Секция для генерации изображения из текста */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4"
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaImage className="mr-2" /> {t('generateImage')}
                </label>
                <input
                  type="text"
                  placeholder={t('enterTextForImage')}
                  onChange={(e) => setResult(e.target.value)}
                  className="block w-full text-gray-300 bg-gray-800 rounded-lg p-2 mb-4 shadow-md"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generateImageFromText(result)}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center"
                >
                  <FaImage className="mr-2" /> {t('generate')}
                </motion.button>
              </motion.div>

              {/* Секция для загрузки файла и генерации текста */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4"
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaUpload className="mr-2" /> {t('selectFile')}
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-gray-300 bg-gray-800 rounded-lg p-2 mb-4 shadow-md"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center"
                >
                  <FaUpload className="mr-2" /> {t('upload')}
                </motion.button>
              </motion.div>

              {/* Секция для создания видео из изображения */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4"
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaVideo className="mr-2" /> {t('createVideoFromImage')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-gray-300 bg-gray-800 rounded-lg p-2 mb-4 shadow-md"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createVideoFromImage}
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center"
                >
                  <FaVideo className="mr-2" /> {t('createVideo')}
                </motion.button>
              </motion.div>

              {/* Секция для работы с камерой */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-lg shadow-lg mb-4"
              >
                <label className="block mb-2 text-lg flex items-center">
                  <FaCamera className="mr-2" /> {t('captureMedia')}
                </label>
                {!cameraStream ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCamera}
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg mb-4 flex items-center justify-center"
                  >
                    <FaCamera className="mr-2" /> {t('startCamera')}
                  </motion.button>
                ) : (
                  <>
                    <video id="camera" autoPlay className="w-full mb-4 rounded-lg shadow-md"></video>
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={capturePhoto}
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center"
                      >
                        <FaCamera className="mr-2" /> {t('capturePhoto')}
                      </motion.button>
                      {!recording ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startRecording}
                          className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center"
                        >
                          <FaVideo className="mr-2" /> {t('startRecording')}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={stopRecording}
                          className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center"
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
                    className="mt-4 p-4 bg-gray-800 rounded-lg shadow-lg"
                  >
                    {capturedMedia.includes('image') ? (
                      <img src={capturedMedia} alt="Captured" className="w-full rounded-lg shadow-md" />
                    ) : (
                      <video src={capturedMedia} controls className="w-full rounded-lg shadow-md" />
                    )}
                  </motion.div>
                )}
              </motion.div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-4 p-4 bg-gray-800 rounded-lg shadow-lg"
                >
                  {result.startsWith('http') ? (
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
                    className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg mt-4 flex items-center justify-center"
                  >
                    <FaUpload className="mr-2" /> Download
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