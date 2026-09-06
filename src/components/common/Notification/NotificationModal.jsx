import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Radio,
  MapPin,
  Compass,
  Zap,
  Bell,
  ShieldAlert,
  Car,
  Truck,
  Info,
  Gift,
  Star,
  Utensils,
  Hotel,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import CommonModal from '../CommonModal/index.js';
import { NotificationsSkeleton } from '../../ui/Skeleton.jsx';

const ICON_MAP = {
  Sparkles,
  Radio,
  Utensils,
  Hotel,
  MapPin,
  Compass,
  Zap,
  Bell,
  ShieldAlert,
  Car,
  Truck,
  Info,
  Gift,
  Star,
};

export default function NotificationModal({ isOpen, onClose, announcements = [], loading = false }) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  // Reset page to 0 whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
    }
  }, [isOpen]);

  const total = announcements.length;
  const currentItem = announcements[currentPage];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentPage((p) => Math.min(total - 1, p + 1));
  };

  const IconComp = currentItem ? ICON_MAP[currentItem.icon] || Sparkles : Sparkles;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Bell}
      iconBg="bg-orange-500/10 text-orange-500 border border-orange-500/20"
      title={t('notifications.title', 'Feature Announcements')}
      subtitle={
        total > 1
          ? `${t('notifications.subtitle', 'Latest updates')} (${currentPage + 1} of ${total})`
          : t('notifications.subtitle', 'Latest updates & new features')
      }
      maxWidth="max-w-md"
      actionBtnClass="bg-orange-500 hover:bg-orange-600 shadow-orange-500/25"
      actionLabel="Close"
      onAction={onClose}
      actions={
        total > 1 ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {announcements.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentPage
                      ? 'w-5 bg-orange-500'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to announcement ${idx + 1}`}
                />
              ))}
            </div>

            {currentPage < total - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>Done</span>
              </button>
            )}
          </div>
        ) : undefined
      }
    >
      {loading ? (
        <NotificationsSkeleton count={1} />
      ) : total === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Bell className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">No Announcements</h3>
          <p className="mt-1 text-xs text-slate-500">
            You're all caught up! Check back later for new features.
          </p>
        </div>
      ) : currentItem ? (
        <div
          key={currentItem._id || currentItem.id || currentItem.title}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm shadow-orange-400/30">
              <IconComp className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {currentItem.title}
                </h3>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {currentItem.badge || 'Coming Soon'}
                </span>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="block text-[10px] font-bold tracking-wider uppercase text-orange-500">
                  {t('notifications.useOfFeature', "WHAT'S THE USE OF THIS FEATURE:")}
                </span>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700 font-medium">
                  {currentItem.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </CommonModal>
  );
}
