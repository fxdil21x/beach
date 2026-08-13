import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'hi', label: 'हिन्दी' },
];

export default function LanguageSelector() {
  const [language, setLanguage] = useState('en');

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="rounded border border-gray-300 px-2 py-1 text-sm"
      aria-label="Select language"
    >
      {LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
