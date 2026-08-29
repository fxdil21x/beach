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
} from '../ui/Select.jsx';

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
      <SelectTrigger className={`!h-9 w-[86px] shrink-0 !rounded-xl bg-white border-slate-200/80 px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 ${className}`}>
        <div className="flex items-center gap-1.5 truncate">
          <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
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
