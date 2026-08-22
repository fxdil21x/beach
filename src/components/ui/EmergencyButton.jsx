import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

export default function EmergencyButton({ variant = 'banner' }) {
  const { user } = useAuth();
  const { featureSettings } = useFeatureSettings();
  const { triggerEmergency, userEmergencyState, cancelUserEmergency } = useEmergency();
  const [loading, setLoading] = useState(false);

  // Strictly ONLY show for logged-in users AND when emergencySosEnabled toggle is true
  if (!user || !featureSettings?.emergencySosEnabled) {
    return null;
  }

  const handleEmergencyClick = async () => {
    setLoading(true);
    try {
      await triggerEmergency('Muzhappilangad Drive-In Beach');
    } finally {
      setLoading(false);
    }
  };

  const handleClearState = () => {
    cancelUserEmergency(userEmergencyState?.emergencyId);
  };

  if (userEmergencyState) {
    const isClaimed = userEmergencyState.status === 'CLAIMED';
    return (
      <div className={`rounded-2xl border-2 p-4 shadow-lg animate-in zoom-in-95 duration-200 ${
        isClaimed ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
              isClaimed ? 'bg-emerald-600' : 'bg-red-600 animate-bounce'
            }`}>
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-sm font-black leading-snug ${isClaimed ? 'text-emerald-900' : 'text-red-900'}`}>
                {isClaimed
                  ? `Officer Connected: ${userEmergencyState.claimedBy || 'Gate Admin'}`
                  : 'Emergency alert sent. Waiting for an admin.'}
              </p>
              <p className={`text-[11px] font-medium ${isClaimed ? 'text-emerald-700' : 'text-red-700'}`}>
                {isClaimed
                  ? 'Voice call active. Assistance is connected.'
                  : 'Gate officers and patrol admins have been alerted with alarm & vibration.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearState}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer ${
              isClaimed ? 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300' : 'bg-red-200 text-red-800 hover:bg-red-300'
            }`}
            title="Cancel & Dismiss Emergency Alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={handleEmergencyClick}
        className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-1.5 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ShieldAlert className="h-3.5 w-3.5" />
        )}
        <span>SOS Emergency</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 p-4 text-white shadow-xl space-y-3">
      {/* Row 1: Icon + Title + Description */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
          <AlertTriangle className="h-6 w-6 text-amber-200" />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-wide uppercase drop-shadow-xs">
            Need Assistance?
          </h3>
          <p className="text-xs text-red-100 font-medium">
            Trigger instant loud alarm sound &amp; vibration for all on-duty admins.
          </p>
        </div>
      </div>

      {/* Row 2: Full-width EMERGENCY SOS button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleEmergencyClick}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-red-700 hover:bg-red-50 active:scale-95 px-4 py-2.5 text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-red-600" />
        )}
        <span>EMERGENCY SOS</span>
      </button>
    </div>
  );
}
