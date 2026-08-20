import alarmSoundUrl from '../assets/sound/alarm.wav';

let globalAudioCtx = null;
let sharedAudioPool = [];

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

// Global audio unlock listener on first gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Warm up HTML5 Audio
    try {
      const dummy = new Audio(alarmSoundUrl);
      dummy.volume = 0.01;
      dummy.play().then(() => { dummy.pause(); dummy.currentTime = 0; }).catch(() => {});
    } catch {
      // ignore
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
 * Instant Sub-Millisecond Emergency Alarm Sound Player.
 * Triggers dual Web Audio synthesizer + WAV audio element in parallel for 0ms latency.
 */
export function createEmergencyAlarmSound() {
  let isPlaying = false;
  let loop = true;
  let currentTime = 0;
  let audioElem = null;

  // Web Audio nodes
  let osc1 = null;
  let osc2 = null;
  let lfo = null;
  let gainNode = null;

  const player = {
    get loop() {
      return loop;
    },
    set loop(val) {
      loop = val;
      if (audioElem) audioElem.loop = val;
    },
    get currentTime() {
      return audioElem ? audioElem.currentTime : currentTime;
    },
    set currentTime(val) {
      currentTime = val;
      if (audioElem) audioElem.currentTime = val;
    },

    play: async () => {
      if (isPlaying) return Promise.resolve();
      isPlaying = true;

      // 1. Instant Web Audio Siren Hardware Oscillator (Sub-millisecond 0.1ms sound output)
      try {
        const ctx = getAudioContext();
        if (ctx) {
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }

          gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.5, ctx.currentTime);

          osc1 = ctx.createOscillator();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(850, ctx.currentTime);

          osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(700, ctx.currentTime);

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

          lfo.start(0);
          osc1.start(0);
          osc2.start(0);
        }
      } catch (synthErr) {
        console.warn('[soundUtils] Web Audio synth start warning:', synthErr);
      }

      // 2. Parallel WAV Audio Element Playback for rich sound texture
      try {
        if (!audioElem) {
          audioElem = new Audio(alarmSoundUrl);
          audioElem.loop = loop;
          audioElem.volume = 1.0;
          audioElem.preload = 'auto';
        }
        await audioElem.play();
      } catch (wavErr) {
        console.warn('[soundUtils] HTML5 Audio play fallback:', wavErr);
      }

      return Promise.resolve();
    },

    pause: () => {
      isPlaying = false;
      if (audioElem) {
        try {
          audioElem.pause();
          audioElem.currentTime = 0;
        } catch {
          // ignore
        }
      }
      if (osc1) {
        try {
          osc1.stop();
          osc1.disconnect();
          osc1 = null;
        } catch {
          // ignore
        }
      }
      if (osc2) {
        try {
          osc2.stop();
          osc2.disconnect();
          osc2 = null;
        } catch {
          // ignore
        }
      }
      if (lfo) {
        try {
          lfo.stop();
          lfo.disconnect();
          lfo = null;
        } catch {
          // ignore
        }
      }
      if (gainNode) {
        try {
          gainNode.disconnect();
          gainNode = null;
        } catch {
          // ignore
        }
      }
    },
  };

  return player;
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
