import { useState, useEffect } from 'react';
import axios from 'axios';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaCamera, FaVideo, FaImage, FaUpload, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

export default function Home({ initialLocale }) {
    const { t, i18n } = useTranslation();
    const { data: session, status } = useSession();
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
        setCurrentLocale(effectiveLocale);
        i18n.changeLanguage(effectiveLocale);
    }, [locale, initialLocale, i18n]);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.name) {
            setUserName(session.user.name);
        }
    }, [session, status]);

    const handleUpload = async () => {
        if (!session) return alert('Please sign in');
        if (!file) return alert('Please select a file');
        const formData = new FormData();
        console.log('Uploading file:', file);
        formData.append('file', file);
        formData.append('prompt', 'Generate a detailed caption for this image in a professional tone');
        try {
            const res = await axios.post('http://3.25.58.70:5000/api/generate', formData);
            setResult(res.data.generatedContent);
        } catch (err) {
            console.error('Error in handleUpload:', err);
            if (err.response) {
                setResult(`Upload failed: ${err.response.data.error || 'Server error'}`);
            } else {
                setResult(t('error'));
            }
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
            if (err.response) {
                setResult(`Image generation failed: ${err.response.data.error || 'Server error'}`);
            } else {
                setResult(t('error'));
            }
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
            alert('Could not access the camera');
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
            console.log('Uploading image for video:', file);
            formData.append('image', file);
            const res = await axios.post('http://3.25.58.70:5000/api/image-to-video', formData);
            setResult(res.data.videoUrl);
        } catch (err) {
            console.error('Error in createVideoFromImage:', err);
            if (err.response) {
                setResult(`Video creation failed: ${err.response.data.error || 'Server error'}`);
            } else {
                setResult(t('error'));
            }
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
                            className="button-login"
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
                                className="button-logout"
                            >
                                <FaSignOutAlt className="mr-2" /> {t('logout')}
                            </motion.button>

                            {/* Секция для генерации изображения из текста */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="card mb-4"
                            >
                                <label className="block mb-2 text-lg flex items-center">
                                    <FaImage className="mr-2" /> {t('generateImage')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('enterTextForImage')}
                                    onChange={(e) => setResult(e.target.value)}
                                    className="input-file"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => generateImageFromText(result)}
                                    className="button-upload"
                                >
                                    <FaImage className="mr-2" /> {t('generate')}
                                </motion.button>
                            </motion.div>

                            {/* Секция для загрузки файла и генерации текста */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="card mb-4"
                            >
                                <label className="block mb-2 text-lg flex items-center">
                                    <FaUpload className="mr-2" /> {t('selectFile')}
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="input-file"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUpload}
                                    className="button-upload"
                                >
                                    <FaUpload className="mr-2" /> {t('upload')}
                                </motion.button>
                            </motion.div>

                            {/* Секция для создания видео из изображения */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="card mb-4"
                            >
                                <label className="block mb-2 text-lg flex items-center">
                                    <FaVideo className="mr-2" /> {t('createVideoFromImage')}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="input-file"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={createVideoFromImage}
                                    className="button-upload"
                                >
                                    <FaVideo className="mr-2" /> {t('createVideo')}
                                </motion.button>
                            </motion.div>

                            {/* Секция для работы с камерой */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="card mb-4"
                            >
                                <label className="block mb-2 text-lg flex items-center">
                                    <FaCamera className="mr-2" /> {t('captureMedia')}
                                </label>
                                {!cameraStream ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startCamera}
                                        className="button-upload mb-4"
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
                                                className="button-upload"
                                            >
                                                <FaCamera className="mr-2" /> {t('capturePhoto')}
                                            </motion.button>
                                            {!recording ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={startRecording}
                                                    className="button-upload"
                                                >
                                                    <FaVideo className="mr-2" /> {t('startRecording')}
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={stopRecording}
                                                    className="button-logout"
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
                                        className="result"
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
                                    className="result"
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
                                        className="button-upload mt-4"
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

export async function getServerSideProps({ params }) {
    const initialLocale = params?.locale || 'en';
    return {
        props: {
            initialLocale,
        },
    };
}