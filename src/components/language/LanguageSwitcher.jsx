import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { changeLanguage } from '../../i18n/i18n.js';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '../ui/select.jsx';

const LANGUAGES = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'ml', short: 'ML', name: 'Malayalam (മലയാളം)' },
  { code: 'hi', short: 'HI', name: 'Hindi (हिंदी)' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const current = (i18n.language || 'en').split('-')[0];
  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <Select value={current} onValueChange={(val) => changeLanguage(val)}>
      <SelectTrigger className={`h-10 w-[94px] rounded-xl bg-slate-50 border-slate-200/90 px-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs ${className}`}>
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="h-4 w-4 text-slate-500 shrink-0" />
          <SelectValue>{currentLang.short}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="w-[180px] right-0 left-auto z-[9999] shadow-2xl">
        <SelectGroup>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
