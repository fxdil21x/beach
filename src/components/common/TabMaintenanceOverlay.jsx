import { Link } from 'react-router-dom';
import {
  Wrench,
  Construction,
  TriangleAlert,
  ShieldAlert,
  Clock,
  Radio,
  Lock,
  Sparkles,
  Bell,
  Car,
  Utensils,
  Info,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

export const ICON_MAP = {
  Wrench,
  Construction,
  AlertTriangle: TriangleAlert,
  ShieldAlert,
  Clock,
  Radio,
  Lock,
  Sparkles,
  Bell,
  Car,
  Utensils,
  Info,
  Flame,
};

export default function TabMaintenanceOverlay({ tabId, fallbackTitle = 'Feature Under Maintenance' }) {
  const { getTabMaintenance } = useFeatureSettings();
  const info = getTabMaintenance(tabId);

  if (!info || !info.isBlocked) return null;

  const IconComponent = ICON_MAP[info.icon] || Wrench;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-lg bg-slate-950/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/95 p-6 text-center text-white shadow-2xl shadow-amber-950/50">
        {/* Glowing Background Ring */}
        <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-orange-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Glowing Animated Icon Badge */}
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 shadow-inner">
            <div className="absolute inset-0 rounded-3xl bg-amber-500/10 animate-ping opacity-75" />
            <IconComponent className="relative h-10 w-10 text-amber-400 drop-shadow-md" />
          </div>

          {/* Maintenance Tag */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-bold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Temporarily Paused</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-extrabold text-white sm:text-xl">
            {info.title || fallbackTitle}
          </h2>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-300">
            {info.description || 'This feature is currently undergoing scheduled updates by the beach administration team.'}
          </p>

          {/* Action Button */}
          <div className="mt-6 w-full">
            <Link
              to="/user/home"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:opacity-95 active:scale-98 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
