import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import it from '../locales/it.json';
import { getTranslation } from '../services/translationService';

/**
 * Normalizza il codice lingua estraendo solo la parte principale (ISO 2)
 * e gestendo casi particolari come il vecchio codice per l'Indonesiano.
 */
const normalizeLanguage = (lng: string): string => {
  if (!lng) return 'en';
  const base = lng.split('-')[0].toLowerCase();
  // "in" è il vecchio codice per l'Indonesiano, ora si usa "id"
  if (base === 'in') return 'id';
  return base;
};

// Backend personalizzato per gestire traduzioni dinamiche tramite Gemini
const dynamicGeminiBackend = {
  type: 'backend' as const,
  read: (language: string, _namespace: string, callback: (error: any, data: any) => void) => {
    const baseLng = normalizeLanguage(language);
    
    // 1. Controlla prima i file statici locali (IT e EN sono pre-caricati)
    if (baseLng === 'it') {
      callback(null, it);
      return;
    }
    if (baseLng === 'en') {
      callback(null, en);
      return;
    }
    
    // 2. Recupera da Gemini Service (con caching in DB locale) per altre lingue
    getTranslation(baseLng)
      .then(data => {
        if (data) {
          callback(null, data);
        } else {
          // Se la traduzione fallisce, i18next userà fallbackLng ('en')
          callback(null, null);
        }
      })
      .catch(err => {
        console.warn(`Traduzione dinamica fallita per ${language}:`, err);
        callback(null, null);
      });
  }
};

i18n
  // Rilevatore lingua del browser: controlla localStorage, poi il navigatore
  .use(LanguageDetector)
  // Backend per caricamento dinamico
  .use(dynamicGeminiBackend)
  // Integrazione con React
  .use(initReactI18next)
  .init({
    // Lingua di riserva se quella richiesta non è disponibile
    fallbackLng: 'en',
    
    // Supporta solo codici lingua semplici (es. 'it' invece di 'it-IT')
    load: 'languageOnly',
    
    interpolation: {
      escapeValue: false // React protegge già da XSS
    },
    
    detection: {
      // Ordine di ricerca: localStorage (scelta utente), navigator (browser/dispositivo), poi querystring
      order: ['localStorage', 'navigator', 'querystring'],
      // Salva la scelta nel localStorage per la persistenza
      caches: ['localStorage'],
      // Opzionalmente normalizza il rilevamento
      convertDetectedLanguage: (lng) => normalizeLanguage(lng)
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;
