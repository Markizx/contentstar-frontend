import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          title: 'ContentStar',
          welcome: 'Welcome, {{name}}!',
          login: 'Login with Google',
          logout: 'Logout',
          selectFile: 'Select a file to upload',
          upload: 'Upload',
          error: 'An error occurred. Please try again.',
        },
      },
      ru: {
        translation: {
          title: 'ContentStar',
          welcome: 'Добро пожаловать, {{name}}!',
          login: 'Войти через Google',
          logout: 'Выйти',
          selectFile: 'Выберите файл для загрузки',
          upload: 'Загрузить',
          error: 'Произошла ошибка. Попробуйте снова.',
        },
      },
      uk: {
        translation: {
          title: 'ContentStar',
          welcome: 'Ласкаво просимо, {{name}}!',
          login: 'Увійти через Google',
          logout: 'Вийти',
          selectFile: 'Виберіть файл для завантаження',
          upload: 'Завантажити',
          error: 'Сталася помилка. Спробуйте знову.',
        },
      },
      es: {
        translation: {
          title: 'ContentStar',
          welcome: '¡Bienvenido, {{name}}!',
          login: 'Iniciar sesión con Google',
          logout: 'Cerrar sesión',
          selectFile: 'Selecciona un archivo para cargar',
          upload: 'Cargar',
          error: 'Ocurrió un error. Por favor, intenta de nuevo.',
        },
      },
      de: {
        translation: {
          title: 'ContentStar',
          welcome: 'Willkommen, {{name}}!',
          login: 'Mit Google anmelden',
          logout: 'Abmelden',
          selectFile: 'Wähle eine Datei zum Hochladen aus',
          upload: 'Hochladen',
          error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        },
      },
      fr: {
        translation: {
          title: 'ContentStar',
          welcome: 'Bienvenue, {{name}}!',
          login: 'Se connecter avec Google',
          logout: 'Se déconnecter',
          selectFile: 'Sélectionne un fichier à télécharger',
          upload: 'Télécharger',
          error: 'Une erreur s\'est produite. Veuillez réessayer.',
        },
      },
    },
    fallbackLng: 'en',
    detection: {
      order: ['path', 'cookie', 'htmlTag'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;