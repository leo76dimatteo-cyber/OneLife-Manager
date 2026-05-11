import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import it from '../locales/it.json';
import { getTranslation } from '../services/translationService';

// Custom backend to handle dynamic translations via Gemini
const dynamicGeminiBackend = {
  type: 'backend' as const,
  read: (language: string, _namespace: string, callback: (error: any, data: any) => void) => {
    const baseLng = language.split('-')[0];
    
    // 1. Check local static files first
    if (baseLng === 'it') {
      callback(null, it);
      return;
    }
    if (baseLng === 'en') {
      callback(null, en);
      return;
    }
    
    // 2. Fetch from Gemini Service (with local DB caching)
    getTranslation(baseLng)
      .then(data => {
        if (data) {
          callback(null, data);
        } else {
          // If translation fails, i18next will use fallbackLng
          callback(null, null);
        }
      })
      .catch(err => {
        console.warn(`Dynamic translation failed for ${language}:`, err);
        callback(null, null);
      });
  }
};

i18n
  .use(LanguageDetector)
  .use(dynamicGeminiBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator', 'querystring'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
