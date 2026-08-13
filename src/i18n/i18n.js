import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ml from './locales/ml.json';
import hi from './locales/hi.json';

const STORAGE_KEY = 'beach_app_language';

function getStoredLanguage(defaultLang = 'en') {
  if (typeof window === 'undefined') return defaultLang;
  return localStorage.getItem(STORAGE_KEY) || defaultLang;
}

export function getDefaultLanguageForPath(pathname) {
  if (pathname.startsWith('/entry')) {
    return getStoredLanguage('ml');
  }
  return getStoredLanguage('en');
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ml: { translation: ml },
    hi: { translation: hi },
  },
  lng: getStoredLanguage('en'),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function changeLanguage(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  return i18n.changeLanguage(lang);
}

export default i18n;
