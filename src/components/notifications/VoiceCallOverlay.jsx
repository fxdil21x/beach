import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, PhoneOff, Volume2, Radio, AlertTriangle } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext.jsx';

/* Animated sound-wave bars */
function SoundWave({ active }) {
  const bars = [0.4, 0.7, 1, 0.7, 0.9, 0.6, 1, 0.5, 0.8, 0.4];
  return (
    <div className="flex items-center gap-1 h-9">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-colors duration-300 ${
            active ? 'bg-emerald-400' : 'bg-slate-600'
          }`}
          style={{
            height: `${h * 100}%`,
            animation: active ? `wave 0.9s ease-in-out ${i * 0.09}s infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* Pulsing ring around the avatar */
function PulsingRing({ color }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: -(i + 1) * 14,
            border: `1.5px solid ${color}`,
            opacity: 0.25 - i * 0.07,
            animation: `ringPulse 2s ease-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export default function VoiceCallOverlay() {
  const { callState, endCall, toggleMute } = useEmergency();
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  const isOpen = Boolean(callState && callState.status !== 'ended');

  // Resolve portal target (inside device mockup if present, else document.body)
  useEffect(() => {
    if (!isOpen) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    const deviceLayer = window.__deviceModalLayer;
    setPortalTarget(deviceLayer || document.body);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resolvedRef.current = false;
      setPortalTarget(null);
    }
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (callState?.status !== 'connected') {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [callState?.status]);

  if (!isOpen || !portalTarget) return null;

  const isConnected = callState.status === 'connected';
  const isCalling = callState.status === 'calling';

  const accent = isConnected ? '#22c55e' : '#f59e0b';
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleMute = () => {
    toggleMute();
    setMuted((m) => !m);
  };

  const handleEnd = () => endCall(callState.emergencyId);

  const statusLabel = isConnected
    ? formatTime(elapsed)
    : isCalling
    ? 'Calling…'
    : 'Connecting…';

  const content = (
    <>
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.25; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="absolute inset-0 z-[100000] flex flex-col items-center justify-center p-6 text-white overflow-hidden animate-in fade-in duration-300"
        style={{
          background: 'linear-gradient(160deg, #020617 0%, #0f172a 60%, #0d1b2a 100%)',
          animation: 'fadeSlideUp 0.35s ease',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${accent}22 0%, transparent 65%)`,
          }}
        />

        {/* SOS badge */}
        <div className="relative mb-8 flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 px-3.5 py-1 text-[11px] font-bold tracking-wider text-rose-400 uppercase shadow-xs">
          <Radio className="h-3.5 w-3.5 animate-pulse text-rose-400" />
          <span>Emergency Call</span>
        </div>

        {/* Avatar ring */}
        <div className="relative mb-7">
          <PulsingRing color={accent} />
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold shadow-2xl transition-all"
            style={{
              background: `linear-gradient(135deg, ${accent}44, ${accent}15)`,
              border: `2px solid ${accent}`,
            }}
          >
            🎙️
          </div>
        </div>

        {/* Peer name */}
        <h2 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight px-4 truncate max-w-xs">
          {callState.peerName || 'Unknown'}
        </h2>

        {/* Status / timer */}
        <p
          className={`mt-1.5 mb-6 text-center tabular-nums transition-colors ${
            isConnected
              ? 'text-2xl font-black tracking-widest text-emerald-400'
              : 'text-sm font-semibold text-slate-400'
          }`}
        >
          {statusLabel}
        </p>

        {/* Sound wave */}
        <div className="mb-8">
          <SoundWave active={isConnected} />
        </div>

        {/* Error hint */}
        {callState.error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/30 px-4 py-2 text-xs text-rose-300 max-w-xs text-center">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              {callState.error === 'Permission denied'
                ? 'Microphone access denied. Please allow mic in browser.'
                : callState.error}
            </span>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center gap-5 relative z-10">
          {/* Mute Button */}
          <button
            type="button"
            onClick={handleMute}
            title={muted ? 'Unmute microphone' : 'Mute microphone'}
            className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all active:scale-95 cursor-pointer backdrop-blur-md ${
              muted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/15'
            }`}
          >
            {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEnd}
            title="End Call"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-xl shadow-rose-600/50 hover:shadow-rose-600/70 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <PhoneOff className="h-7 w-7" />
          </button>

          {/* Speaker Indicator */}
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all ${
              isConnected
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
          >
            <Volume2 className="h-6 w-6" />
          </div>
        </div>

        {/* Bottom hint */}
        <p className="mt-8 text-center text-xs text-slate-400 font-medium tracking-wide">
          {isConnected ? 'Voice call active — speak normally' : 'Waiting for user to connect…'}
        </p>
      </div>
    </>
  );

  return createPortal(content, portalTarget);
}
