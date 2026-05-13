import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ptBR } from '../locales/pt-BR';
import { en } from '../locales/en';

export type Lang = 'pt-BR' | 'en';

const LANG_KEY = 'caminare.lang';

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'pt-BR';
  const stored = window.localStorage.getItem(LANG_KEY) as Lang | null;
  if (stored === 'pt-BR' || stored === 'en') return stored;
  const browser = window.navigator.language?.toLowerCase() ?? 'pt';
  return browser.startsWith('pt') ? 'pt-BR' : 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      en: { translation: en },
    },
    lng: detectInitialLang(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export function setLanguage(lang: Lang) {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANG_KEY, lang);
  }
}

export function getLanguage(): Lang {
  return (i18n.language as Lang) ?? 'pt-BR';
}

export default i18n;
