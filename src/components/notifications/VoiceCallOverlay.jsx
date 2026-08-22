import { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext.jsx';

/* Animated sound-wave bars */
function SoundWave({ active }) {
  const bars = [0.4, 0.7, 1, 0.7, 0.9, 0.6, 1, 0.5, 0.8, 0.4];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 99,
            background: active ? '#4ade80' : '#6b7280',
            height: `${h * 100}%`,
            animation: active ? `wave 0.9s ease-in-out ${i * 0.09}s infinite alternate` : 'none',
            transition: 'background 0.3s',
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
          style={{
            position: 'absolute',
            inset: -(i + 1) * 14,
            borderRadius: '50%',
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
  const { callState, endCall, toggleMute, isMuted } = useEmergency();
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (callState?.status !== 'connected') { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [callState?.status]);

  if (!callState || callState.status === 'ended') return null;

  const isConnected = callState.status === 'connected';
  const isCalling   = callState.status === 'calling';
  const isIncoming  = callState.status === 'incoming';

  const accent = isConnected ? '#22c55e' : '#f59e0b';
  const bg     = 'linear-gradient(160deg,#020617 0%,#0f172a 60%,#0d1b2a 100%)';

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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

  return (
    <>
      {/* keyframe injector */}
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
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: bg,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          animation: 'fadeSlideUp 0.35s ease',
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 35%, ${accent}22 0%, transparent 65%)`,
        }} />

        {/* SOS badge */}
        <div style={{
          marginBottom: 32,
          padding: '5px 14px', borderRadius: 999,
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
          color: '#f87171', textTransform: 'uppercase',
        }}>
          🆘 Emergency Call
        </div>

        {/* Avatar ring */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <PulsingRing color={accent} />
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent}55, ${accent}22)`,
            border: `2px solid ${accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            🎙
          </div>
        </div>

        {/* Peer name */}
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
          {callState.peerName || 'Unknown'}
        </h2>

        {/* Status / timer */}
        <p style={{
          marginTop: 6, marginBottom: 24,
          fontSize: isConnected ? 28 : 14,
          fontWeight: isConnected ? 700 : 500,
          color: isConnected ? accent : '#94a3b8',
          letterSpacing: isConnected ? '2px' : 0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {statusLabel}
        </p>

        {/* Sound wave */}
        <div style={{ marginBottom: 36 }}>
          <SoundWave active={isConnected} />
        </div>

        {/* Error hint */}
        {callState.error && (
          <p style={{
            marginBottom: 20, padding: '8px 16px', borderRadius: 12,
            background: 'rgba(239,68,68,0.12)', color: '#fca5a5',
            fontSize: 13, textAlign: 'center', maxWidth: 300,
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
            ⚠ {callState.error === 'Permission denied'
              ? 'Microphone access denied. Please allow mic and try again.'
              : callState.error}
          </p>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {/* Mute */}
          <button
            onClick={handleMute}
            title={muted ? 'Unmute' : 'Mute'}
            style={{
              width: 58, height: 58, borderRadius: '50%',
              background: muted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
              border: muted ? '1.5px solid #ef4444' : '1.5px solid rgba(255,255,255,0.15)',
              color: muted ? '#f87171' : '#cbd5e1',
              fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
            }}
          >
            {muted ? '🔇' : '🎤'}
          </button>

          {/* End Call */}
          <button
            onClick={handleEnd}
            title="End call"
            style={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(239,68,68,0.5)',
              color: '#fff', fontSize: 26, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(135deg)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(239,68,68,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.5)'; }}
          >
            📞
          </button>

          {/* Speaker placeholder — shows call is live */}
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: isConnected ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
            border: isConnected ? '1.5px solid #22c55e' : '1.5px solid rgba(255,255,255,0.1)',
            color: isConnected ? '#4ade80' : '#475569',
            fontSize: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.4s',
          }}>
            🔊
          </div>
        </div>

        {/* Bottom hint */}
        <p style={{
          marginTop: 36, fontSize: 11, color: '#475569',
          letterSpacing: '0.3px', textAlign: 'center',
        }}>
          {isConnected ? 'Voice call active — speak normally' : 'Waiting for user to connect…'}
        </p>
      </div>
    </>
  );
}
