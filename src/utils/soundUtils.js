import alarmSoundUrl from '../assets/sound/alarm.mp4';

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

// Global unlock listener on first touch/click
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
 * Robust Emergency Alarm Sound Player.
 * Uses alarm.mp4 file with Web Audio API siren fallback so sound plays reliably on all browsers.
 */
export function createEmergencyAlarmSound() {
  let isPlaying = false;
  let loop = true;
  let currentTime = 0;
  let audioElem = null;

  // Web Audio fallback nodes
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

      // Primary attempt: HTML5 Audio Element with alarm.mp4
      try {
        if (!audioElem) {
          audioElem = new Audio(alarmSoundUrl);
          audioElem.loop = loop;
          audioElem.volume = 1.0;
        }
        await audioElem.play();
        return Promise.resolve();
      } catch (mp4Err) {
        console.warn('[soundUtils] HTML5 Audio play blocked/failed, switching to Web Audio synth fallback:', mp4Err);
      }

      // Secondary fallback: Web Audio API Synthesized Siren
      try {
        const ctx = getAudioContext();
        if (!ctx) return Promise.reject(new Error('Audio not supported'));
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);

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

        lfo.start();
        osc1.start();
        osc2.start();

        return Promise.resolve();
      } catch (synthErr) {
        isPlaying = false;
        return Promise.reject(synthErr);
      }
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
