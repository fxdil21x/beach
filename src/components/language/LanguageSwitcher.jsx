import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/i18n.js';

const LANGUAGES = [
  { code: 'en', short: 'EN', labelKey: 'language.en' },
  { code: 'ml', short: 'ML', labelKey: 'language.ml' },
  { code: 'hi', short: 'HI', labelKey: 'language.hi' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation();
  const current = (i18n.language || 'en').split('-')[0];

  return (
    <select
      value={current}
      onChange={(e) => changeLanguage(e.target.value)}
      className={`max-w-[5.5rem] shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-semibold sm:max-w-none sm:px-3 sm:text-sm ${className}`}
      aria-label={t('language.select')}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.short}
        </option>
      ))}
    </select>
  );
}
