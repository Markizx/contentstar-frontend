import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Кастомный детектор для SSR
const pathDetector = {
  name: 'path',
  lookup(req) {
    if (req) {
      const path = req.url || '';
      const locale = path.split('/')[1];
      const supportedLocales = ['en', 'ru', 'uk', 'es', 'de', 'fr'];
      return supportedLocales.includes(locale) ? locale : 'en';
    }
    return undefined;
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          title: 'ContentStar',
          login: 'Sign in with Google',
          logout: 'Sign out',
          welcome: 'Hello, {name}!',
          upload: 'Generate Content',
          error: 'Error generating content',
          selectFile: 'Select a file',
        },
      },
      ru: {
        translation: {
          title: 'ContentStar',
          login: 'Войти через Google',
          logout: 'Выйти',
          welcome: 'Привет, {name}!',
          upload: 'Сгенерировать контент',
          error: 'Ошибка при генерации контента',
          selectFile: 'Выберите файл',
        },
      },
      uk: {
        translation: {
          title: 'ContentStar',
          login: 'Увійти через Google',
          logout: 'Вийти',
          welcome: 'Привіт, {name}!',
          upload: 'Згенерувати контент',
          error: 'Помилка при генерації контенту',
          selectFile: 'Виберіть файл',
        },
      },
      es: {
        translation: {
          title: 'ContentStar',
          login: 'Iniciar sesión con Google',
          logout: 'Cerrar sesión',
          welcome: '¡Hola, {name}!',
          upload: 'Generar contenido',
          error: 'Error al generar contenido',
          selectFile: 'Selecciona un archivo',
        },
      },
      de: {
        translation: {
          title: 'ContentStar',
          login: 'Mit Google anmelden',
          logout: 'Abmelden',
          welcome: 'Hallo, {name}!',
          upload: 'Inhalt generieren',
          error: 'Fehler beim Generieren des Inhalts',
          selectFile: 'Wähle eine Datei aus',
        },
      },
      fr: {
        translation: {
          title: 'ContentStar',
          login: 'Se connecter avec Google',
          logout: 'Se déconnecter',
          welcome: 'Bonjour, {name}!',
          upload: 'Générer du contenu',
          error: 'Erreur lors de la génération du contenu',
          selectFile: 'Sélectionnez un fichier',
        },
      },
    },
    supportedLngs: ['en', 'ru', 'uk', 'es', 'de', 'fr'],
    fallbackLng: 'en',
    detection: {
      order: ['path', 'navigator'],
      caches: [],
      lookupFromPathIndex: 0,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;