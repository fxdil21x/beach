import { createPortal } from 'react-dom';
import { Siren, Volume2, ShieldAlert, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext.jsx';
import Button from '../ui/Button.jsx';

export default function AdminEmergencyOverlay() {
  const { activeEmergencies, claimEmergency, autoplayBlocked, retryAudioUnlock } = useEmergency();

  const emergencyList = Object.values(activeEmergencies);

  if (emergencyList.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-red-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
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

        {/* Autoplay blocked banner */}
        {autoplayBlocked && (
          <div className="bg-amber-500 px-6 py-3 text-slate-950 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Volume2 className="h-4 w-4 shrink-0 animate-bounce" />
              <span>Browser audio autoplay restricted! Tap to enable siren.</span>
            </div>
            <button
              type="button"
              onClick={retryAudioUnlock}
              className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-black text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              Enable Sound 🔊
            </button>
          </div>
        )}

        {/* Emergency Cards List */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {emergencyList.map((item) => (
            <div
              key={item.emergencyId}
              className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-slate-800/90 p-4 shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-block rounded-md bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400">
                    ID: {item.emergencyId}
                  </span>

                  <h3 className="text-base font-bold text-white">
                    {item.userName}
                  </h3>

                  {item.userPhone && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{item.userPhone}</span>
                    </p>
                  )}

                  <p className="text-xs text-slate-400">
                    📍 Location: <strong className="text-slate-200">{item.location}</strong>
                  </p>

                  <p className="text-[11px] text-slate-500">
                    ⏰ Time: {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <Button
                  onClick={() => claimEmergency(item.emergencyId)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Connect</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 text-center">
          <p className="text-[11px] font-medium text-slate-400">
            Clicking <strong className="text-emerald-400">Connect</strong> will stop sound & vibration for all admins for that emergency.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
