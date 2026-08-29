import { useTranslation } from 'react-i18next';
import {
  Trash2,
  Recycle,
  Sparkles,
  VolumeX,
  Car,
  Heart,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const ICON_CONFIG = {
  'instruction.noLitter': {
    icon: Trash2,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
  },
  'instruction.useBins': {
    icon: Recycle,
    gradient: 'from-teal-500 to-cyan-600',
    shadow: 'shadow-teal-500/20',
  },
  'instruction.keepClean': {
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20',
  },
  'instruction.noNoise': {
    icon: VolumeX,
    gradient: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/20',
  },
  'instruction.driveSafe': {
    icon: Car,
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-500/20',
  },
  'instruction.respectVisitors': {
    icon: Heart,
    gradient: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-500/20',
  },
  'instruction.followSecurity': {
    icon: ShieldCheck,
    gradient: 'from-cyan-600 to-blue-700',
    shadow: 'shadow-cyan-600/20',
  },
};

export default function BeachInstructionCard({ instructionKey, index = 0 }) {
  const { t } = useTranslation();
  const config = ICON_CONFIG[instructionKey] || {
    icon: CheckCircle2,
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-500/20',
  };
  const IconComp = config.icon;
  const stepNumber = String(index + 1).padStart(2, '0');

  return (
    <div
      className="group relative flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-4.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-md"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-sm ${config.shadow} transition-transform duration-200 group-hover:scale-105`}>
          <IconComp className="h-5.5 w-5.5" strokeWidth={2} />
        </div>
        <p className="text-sm sm:text-base font-semibold leading-snug text-slate-800 dark:text-white">
          {t(instructionKey)}
        </p>
      </div>

      <span className="shrink-0 text-xs font-black text-slate-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
        #{stepNumber}
      </span>
    </div>
  );
}


