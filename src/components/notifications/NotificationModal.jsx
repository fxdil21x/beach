import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
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
  Clock,
} from 'lucide-react';

import { NotificationsSkeleton } from '../ui/Skeleton.jsx';

const ICON_MAP = {
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
};

export default function NotificationModal({ isOpen, onClose, announcements = [], loading = false }) {
  const { t } = useTranslation();


  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white sm:text-base leading-tight">
                {t('notifications.title', 'Feature Announcements')}
              </h2>
              <p className="text-[11px] text-slate-400">
                Upcoming tools & system updates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <NotificationsSkeleton count={2} />
          ) : announcements.length === 0 ? (
            <div className="py-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Announcements</h3>
              <p className="mt-1 text-xs text-slate-500">You're all caught up! Check back later for new features.</p>
            </div>
          ) : (
            announcements.map((item) => {
              const IconComp = ICON_MAP[item.icon] || Sparkles;
              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs shadow-blue-500/20">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          {item.badge || 'Coming Soon'}
                        </span>
                      </div>

                      <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                        <span className="block text-[10px] font-bold tracking-wider uppercase text-indigo-600">
                          {t('notifications.useOfFeature', "WHAT'S THE USE OF THIS FEATURE:")}
                        </span>
                        <p className="mt-1 text-xs leading-relaxed text-slate-700 font-medium">
                          {item.description}
                        </p>
                      </div>

         
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
