import i18n from 'i18next';
   import { initReactI18next } from 'react-i18next';
   import LanguageDetector from 'i18next-browser-languagedetector';
   import en from './public/locales/en/common.json';
   import ru from './public/locales/ru/common.json';
   import uk from './public/locales/uk/common.json';
   import es from './public/locales/es/common.json';
   import fr from './public/locales/fr/common.json';
   import de from './public/locales/de/common.json';

   i18n
     .use(LanguageDetector)
     .use(initReactI18next)
     .init({
       resources: {
         en: { translation: en },
         ru: { translation: ru },
         uk: { translation: uk },
         es: { translation: es },
         fr: { translation: fr },
         de: { translation: de },
       },
       fallbackLng: 'en',
       interpolation: {
         escapeValue: false,
       },
     });

   export default i18n;