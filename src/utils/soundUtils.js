/**
 * Pure Web Audio API & Hybrid Sound System.
 * Synthesizes loud, penetrating emergency alarm sirens programmatically with 0ms delay,
 * supports optional /sounds/emergency-alarm.mp3, and universally unlocks mobile audio (iOS & Android).
 */

let globalAudioCtx = null;
let isAudioUnlocked = false;

export function getAudioContext() {
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

export async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx) {
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('[soundUtils] AudioContext resume error:', err);
      }
    }
    // Play a brief 1-sample silent buffer to unlock iOS Safari Web Audio pipeline
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {}
  }
  isAudioUnlocked = ctx?.state === 'running';
  return isAudioUnlocked;
}

// Auto-unlock Web Audio context on any user touch/click/pointer event across all mobile & desktop browsers
if (typeof window !== 'undefined') {
  const universalUnlock = () => {
    resumeAudioContext();
    if (globalAudioCtx && globalAudioCtx.state === 'running') {
      window.removeEventListener('click', universalUnlock);
      window.removeEventListener('touchstart', universalUnlock);
      window.removeEventListener('touchend', universalUnlock);
      window.removeEventListener('pointerdown', universalUnlock);
      window.removeEventListener('keydown', universalUnlock);
    }
  };
  window.addEventListener('click', universalUnlock, { passive: true });
  window.addEventListener('touchstart', universalUnlock, { passive: true });
  window.addEventListener('touchend', universalUnlock, { passive: true });
  window.addEventListener('pointerdown', universalUnlock, { passive: true });
  window.addEventListener('keydown', universalUnlock, { passive: true });
}

/**
 * Loud Emergency Alarm Siren Player.
 * Uses Web Audio API oscillator with dual-frequency siren sweep (700Hz <-> 1300Hz),
 * and supports optional /sounds/emergency-alarm.mp3 if present.
 */
export function createEmergencyAlarmSound() {
  let osc = null;
  let gain = null;
  let intervalId = null;
  let playing = false;
  let htmlAudio = null;

  // Try optional HTML5 Audio asset if user placed one in public/sounds
  try {
    htmlAudio = new Audio('/sounds/emergency-alarm.mp3');
    htmlAudio.loop = true;
    htmlAudio.preload = 'auto';
  } catch {}

  const startSynthSiren = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopSynthInternal();

    try {
      osc = ctx.createOscillator();
      gain = ctx.createGain();

      osc.type = 'sawtooth'; // Piercing, attention-grabbing emergency waveform
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(700, now);

      gain.gain.setValueAtTime(0.8, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);

      let high = true;
      intervalId = setInterval(() => {
        if (!globalAudioCtx || !osc) return;
        const currentNow = globalAudioCtx.currentTime;
        const targetFreq = high ? 1300 : 700;
        try {
          osc.frequency.linearRampToValueAtTime(targetFreq, currentNow + 0.32);
        } catch {}
        high = !high;
      }, 350);
    } catch (err) {
      console.warn('[soundUtils] Emergency siren synth error:', err);
    }
  };

  const stopSynthInternal = () => {
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
    set loop(_val) {},
    get isPlaying() {
      return playing;
    },

    play: async () => {
      await resumeAudioContext();
      const ctx = getAudioContext();

      if (playing) return Promise.resolve();
      playing = true;

      // Try playing MP3 if available, otherwise fall back to pure Web Audio siren synthesizer
      let playedMp3 = false;
      if (htmlAudio) {
        try {
          await htmlAudio.play();
          playedMp3 = true;
        } catch {
          playedMp3 = false;
        }
      }

      if (!playedMp3) {
        if (!ctx || ctx.state === 'suspended') {
          return Promise.reject(new Error('AudioContext suspended (Autoplay blocked)'));
        }
        startSynthSiren();
      }

      return Promise.resolve();
    },

    pause: () => {
      playing = false;
      stopSynthInternal();
      if (htmlAudio) {
        try {
          htmlAudio.pause();
          htmlAudio.currentTime = 0;
        } catch {}
      }
    },

    unload: () => {
      playing = false;
      stopSynthInternal();
      if (htmlAudio) {
        try {
          htmlAudio.pause();
          htmlAudio.src = '';
        } catch {}
        htmlAudio = null;
      }
    },
  };
}

/**
 * Plays a crisp synthesized confirmation chime when user clicks Emergency button.
 */
export function playUserConfirmationSound() {
  try {
    resumeAudioContext();
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Ignore audio errors
  }
}
