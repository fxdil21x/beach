/**
 * Pure Web Audio API Sound Synthesizer.
 * Synthesizes high-frequency emergency alarm sirens programmatically with 0ms delay,
 * without relying on external file assets or network downloads.
 */

let globalAudioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (AudioCtxClass) {
      globalAudioCtx = new AudioCtxClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

// Auto-unlock Web Audio context on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
}

/**
 * Pure Web Audio Emergency Alarm Siren Player.
 * Synthesizes a loud, alternating dual-frequency emergency siren (600Hz <-> 1200Hz).
 */
export function createEmergencyAlarmSound() {
  let osc = null;
  let gain = null;
  let intervalId = null;
  let playing = false;

  const startSiren = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopSirenInternal();

    try {
      osc = ctx.createOscillator();
      gain = ctx.createGain();

      osc.type = 'sawtooth'; // Penetrating loud emergency siren waveform
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.7, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);

      let high = true;
      intervalId = setInterval(() => {
        if (!globalAudioCtx || !osc) return;
        const currentNow = globalAudioCtx.currentTime;
        const targetFreq = high ? 1200 : 600;
        osc.frequency.linearRampToValueAtTime(targetFreq, currentNow + 0.3);
        high = !high;
      }, 350);
    } catch (err) {
      console.warn('[soundUtils] Emergency siren synth error:', err);
    }
  };

  const stopSirenInternal = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (osc) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
      osc = null;
    }
    if (gain) {
      try {
        gain.disconnect();
      } catch {}
      gain = null;
    }
  };

  return {
    get loop() {
      return true;
    },
    set loop(val) {},
    get isPlaying() {
      return playing;
    },

    play: async () => {
      if (playing) return Promise.resolve();
      playing = true;
      startSiren();
      return Promise.resolve();
    },

    pause: () => {
      playing = false;
      stopSirenInternal();
    },

    unload: () => {
      playing = false;
      stopSirenInternal();
    },
  };
}

/**
 * Plays a small synthesized confirmation chime when user clicks Emergency button.
 */
export function playUserConfirmationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.1); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore audio errors
  }
}
