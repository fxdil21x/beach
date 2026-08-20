import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Siren, ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext.jsx';

export default function AdminEmergencyOverlay() {
  const { activeEmergencies, claimEmergency, retryAudioUnlock } = useEmergency();

  const emergencyList = Object.values(activeEmergencies);

  // Automatically trigger audio unlock as soon as popup modal appears
  useEffect(() => {
    if (emergencyList.length > 0) {
      retryAudioUnlock();
    }
  }, [emergencyList.length, retryAudioUnlock]);

  if (emergencyList.length === 0) return null;

  return createPortal(
    <div
      onMouseEnter={retryAudioUnlock}
      onPointerDown={retryAudioUnlock}
      onClick={retryAudioUnlock}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-red-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border-2 border-red-500 shadow-2xl shadow-red-600/50">
        
        {/* Pulsing Alarm Top Header */}
        <div className="relative flex items-center justify-between bg-gradient-to-r from-red-600 via-red-500 to-rose-600 px-6 py-4 text-white animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg">
              <Siren className="h-6 w-6 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase drop-shadow-md">
                EMERGENCY ALARM ACTIVE!
              </h2>
              <p className="text-xs font-semibold text-red-100">
                {emergencyList.length} Pending Emergency Alert{emergencyList.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <ShieldAlert className="h-8 w-8 text-red-200 opacity-80" />
        </div>

        {/* Emergency Cards List */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {emergencyList.map((item) => {
            const hasPhone = Boolean(item.userPhone);
            const telUri = hasPhone ? `tel:${item.userPhone}` : null;

            return (
              <div
                key={item.emergencyId}
                className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-slate-800/90 p-4 shadow-lg transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block rounded-md bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400">
                      ID: {item.emergencyId}
                    </span>

                    <h3 className="text-base font-bold text-white">
                      {item.userName}
                    </h3>

                    {hasPhone ? (
                      <p className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Phone: {item.userPhone}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">No phone number provided</p>
                    )}

                    <p className="text-xs text-slate-400">
                      📍 Location: <strong className="text-slate-200">{item.location}</strong>
                    </p>

                    <p className="text-[11px] text-slate-500">
                      ⏰ Time: {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                  {hasPhone ? (
                    <a
                      href={telUri}
                      onClick={() => claimEmergency(item.emergencyId)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>CONNECT & CALL USER ({item.userPhone})</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => claimEmergency(item.emergencyId)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>CLAIM & RESPOND TO EMERGENCY</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 text-center">
          <p className="text-[11px] font-medium text-slate-400">
            Tapping <strong className="text-emerald-400">CONNECT & CALL</strong> dials the user's phone directly and stops the alarm for all admins.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
