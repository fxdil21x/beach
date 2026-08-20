// Web Audio API & Audio utilities for Emergency Alarm & User Feedback

let globalAudioCtx = null;

function getAudioContext() {
  if (!globalAudioCtx && typeof window !== 'undefined') {
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

// Unlock audio on first user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
}

/**
 * Creates an emergency alarm audio generator returning an HTMLAudioElement compatible object.
 * It uses Web Audio API synthesized siren oscillator or fallback data URI so audio loops perfectly.
 */
export function createEmergencyAlarmSound() {
  let isPlaying = false;
  let loop = true;
  let currentTime = 0;

  // We can create a real HTMLAudioElement with a synthesized siren WAV Data URI
  // Or a Web Audio API oscillator loop wrapped in an Audio-like object
  const audioCtx = getAudioContext();
  let osc1 = null;
  let osc2 = null;
  let lfo = null;
  let gainNode = null;

  const audioObj = {
    get loop() {
      return loop;
    },
    set loop(val) {
      loop = val;
    },
    get currentTime() {
      return currentTime;
    },
    set currentTime(val) {
      currentTime = val;
    },

    play: async () => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return Promise.reject(new Error('AudioContext not supported'));
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        if (isPlaying) return Promise.resolve();

        isPlaying = true;
        currentTime = 0;

        gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

        // Siren oscillator 1 (high tone)
        osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(850, ctx.currentTime);

        // Siren oscillator 2 (low-mid modulation)
        osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(700, ctx.currentTime);

        // Low frequency oscillator for siren pitch oscillation (2Hz speed)
        lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2.5, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(350, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        lfo.start();
        osc1.start();
        osc2.start();

        return Promise.resolve();
      } catch (err) {
        isPlaying = false;
        return Promise.reject(err);
      }
    },

    pause: () => {
      if (!isPlaying) return;
      isPlaying = false;
      try {
        if (osc1) { osc1.stop(); osc1.disconnect(); osc1 = null; }
        if (osc2) { osc2.stop(); osc2.disconnect(); osc2 = null; }
        if (lfo) { lfo.stop(); lfo.disconnect(); lfo = null; }
        if (gainNode) { gainNode.disconnect(); gainNode = null; }
      } catch {
        // Ignore stop errors
      }
    },
  };

  return audioObj;
}

/**
 * Plays a small confirmation sound when user clicks Emergency button.
 */
export function playUserConfirmationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two quick ascending chime notes
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
