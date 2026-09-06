import { useEffect, useState } from 'react';
import { Siren, ShieldAlert, Volume2, MapPin, Clock, Radio, PhoneCall, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext.jsx';
import CommonModal from '../common/CommonModal/index.js';

export default function AdminEmergencyOverlay() {
  const { activeEmergencies, claimEmergency, startCall, autoplayBlocked, retryAudioUnlock } = useEmergency();
  const [currentPage, setCurrentPage] = useState(0);

  const emergencyList = Object.values(activeEmergencies);
  const total = emergencyList.length;
  const isOpen = total > 0;

  // Keep page in valid bounds
  useEffect(() => {
    if (currentPage >= total && total > 0) {
      setCurrentPage(total - 1);
    }
  }, [total, currentPage]);

  // Automatically trigger audio unlock as soon as emergency modal appears
  useEffect(() => {
    if (isOpen) {
      retryAudioUnlock();
    }
  }, [isOpen, retryAudioUnlock]);

  if (!isOpen) return null;

  const currentItem = emergencyList[currentPage] || emergencyList[0];
  const displayId = String(currentItem?.emergencyId || '').replace(/^emg_/i, '').slice(-10).toUpperCase();
  const hasPhone = Boolean(currentItem?.userPhone);

  return (
    <div
      onMouseEnter={retryAudioUnlock}
      onPointerDown={retryAudioUnlock}
      onClick={retryAudioUnlock}
    >
      <CommonModal
        isOpen={isOpen}
        onClose={() => {}}
        showCloseButton={false}
        icon={Siren}
        iconBg="bg-rose-50 text-rose-600 border border-rose-200"
        title="EMERGENCY ALARM ACTIVE!"
        subtitle={
          total > 1
            ? `Emergency Alert (${currentPage + 1} of ${total}) • Live SOS`
            : '1 Pending Emergency Alert • Live SOS'
        }
        maxWidth="max-w-md"
        actions={
          <div className="space-y-3">
            {total > 1 && (
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <div className="flex items-center gap-1.5">
                  {emergencyList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPage(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentPage ? 'w-4 bg-rose-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`Go to alert ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(total - 1, p + 1))}
                  disabled={currentPage === total - 1}
                  className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-[11px] font-medium text-slate-500 text-center">
              Tapping <strong className="text-emerald-600">Connect &amp; Talk</strong> opens a live voice call with the user and stops the siren alarm.
            </p>
          </div>
        }
      >
        {/* Autoplay blocked banner after browser refresh */}
        {autoplayBlocked && (
          <div
            onClick={retryAudioUnlock}
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-3 text-slate-950 flex items-center justify-between gap-2 shadow-xs cursor-pointer transition-all hover:opacity-95"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <Volume2 className="h-4 w-4 shrink-0 animate-bounce" />
              <span>Audio siren blocked. Tap to enable siren!</span>
            </div>
            <button
              type="button"
              onClick={retryAudioUnlock}
              className="rounded-xl bg-slate-950 px-3 py-1 text-xs font-black text-white hover:bg-slate-800 transition-colors shrink-0 shadow-xs"
            >
              Enable 🔊
            </button>
          </div>
        )}

        {/* Current Emergency Card */}
        {currentItem && (
          <div
            key={currentItem.emergencyId}
            className="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header badges */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded-md">
                ID: {displayId}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
                LIVE SOS
              </span>
            </div>

            {/* User Information */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {currentItem.userName || 'Beach Visitor'}
              </h3>

              <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                {hasPhone && (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <PhoneCall className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>Phone: {currentItem.userPhone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span className="truncate">
                    Location: <strong className="text-slate-900 font-semibold">{currentItem.location}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    Time: {new Date(currentItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => {
                  claimEmergency(currentItem.emergencyId);
                  startCall(
                    currentItem.emergencyId,
                    currentItem.userId,
                    currentItem.userName || 'Beach Visitor',
                  );
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="h-4 w-4 shrink-0 animate-pulse" />
                <span>🎙 CONNECT &amp; TALK TO USER</span>
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  );
}
