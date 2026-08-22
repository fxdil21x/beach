  import { useEffect } from 'react';
import { Siren, ShieldAlert, PhoneCall, CheckCircle2, Volume2, MapPin, Clock, Radio } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext.jsx';

export default function AdminEmergencyOverlay() {
  const { activeEmergencies, claimEmergency, autoplayBlocked, retryAudioUnlock } = useEmergency();

  const emergencyList = Object.values(activeEmergencies);

  // Automatically trigger audio unlock as soon as popup modal appears or refreshes
  useEffect(() => {
    if (emergencyList.length > 0) {
      retryAudioUnlock();
    }
  }, [emergencyList.length, retryAudioUnlock]);

  if (emergencyList.length === 0) return null;

  return (
    <div
      onMouseEnter={retryAudioUnlock}
      onPointerDown={retryAudioUnlock}
      onClick={retryAudioUnlock}
      className="absolute inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-rose-500/40 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-white">
        
        {/* Futuristic Top Header */}
        <div className="relative flex items-center justify-between border-b border-rose-500/20 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/40 border border-rose-400/40">
              <Siren className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <h2 className="text-sm font-black tracking-wider uppercase text-white drop-shadow-sm">
                  EMERGENCY ALARM ACTIVE!
                </h2>
              </div>
              <p className="text-[11px] font-semibold text-rose-200/80">
                {emergencyList.length} Pending Emergency Alert{emergencyList.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Autoplay blocked banner after browser refresh */}
        {autoplayBlocked && (
          <div
            onClick={retryAudioUnlock}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-5 py-3 text-slate-950 flex items-center justify-between gap-2 shadow-inner cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <Volume2 className="h-4 w-4 shrink-0 animate-bounce" />
              <span>Audio siren requires interaction. Tap to enable sound!</span>
            </div>
            <button
              type="button"
              onClick={retryAudioUnlock}
              className="rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-black text-white hover:bg-slate-800 transition-colors shrink-0 shadow-md"
            >
              Enable Siren 🔊
            </button>
          </div>
        )}

        {/* Emergency Cards List */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {emergencyList.map((item) => {
            const hasPhone = Boolean(item.userPhone);
            const telUri = hasPhone ? `tel:${item.userPhone}` : null;
            const displayId = String(item.emergencyId || '').replace(/^emg_/i, '').slice(-12).toUpperCase();

            return (
              <div
                key={item.emergencyId}
                className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-slate-950/70 p-4 shadow-xl transition-all space-y-3.5 hover:border-rose-500/50"
              >
                {/* Top Badge & User Details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                        ID: {displayId}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                        LIVE SOS
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white tracking-tight truncate">
                      {item.userName || 'Beach Visitor'}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-300">
                      {hasPhone && (
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <PhoneCall className="h-3.5 w-3.5 shrink-0" />
                          <span>Phone: {item.userPhone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-slate-300 text-xs">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                        <span className="truncate">Location: <strong className="text-white font-semibold">{item.location}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span>Time: {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80">
                  {hasPhone ? (
                    <a
                      href={telUri}
                      onClick={() => claimEmergency(item.emergencyId)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                    >
                      <PhoneCall className="h-4 w-4 shrink-0" />
                      <span className="truncate">CONNECT & CALL USER ({item.userPhone})</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => claimEmergency(item.emergencyId)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>CLAIM & RESPOND TO EMERGENCY</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 bg-slate-950/90 px-5 py-3 text-center">
          <p className="text-[11px] font-medium text-slate-400">
            Tapping <strong className="text-emerald-400">CONNECT & CALL</strong> dials the user's phone directly and stops the alarm for all admins.
          </p>
        </div>
      </div>
    </div>
  );
}
