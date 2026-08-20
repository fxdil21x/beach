import { Howl, Howler } from 'howler';
import alarmSoundUrl from '../assets/sound/alarm.wav';

// Auto-unlock Howler audio context on first user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().catch(() => {});
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
 * Howler.js Emergency Alarm Sound Player.
 * Uses Howler.js Web Audio engine with alarm.wav asset for 100% reliable 0ms sound playback.
 */
export function createEmergencyAlarmSound() {
  let sound = new Howl({
    src: [alarmSoundUrl],
    loop: true,
    volume: 1.0,
    html5: false, // Uses Web Audio API for sub-millisecond instant sound
    preload: true,
  });

  const player = {
    get loop() {
      return true;
    },
    set loop(val) {
      if (sound) sound.loop(val);
    },
    get isPlaying() {
      return sound ? sound.playing() : false;
    },

    play: async () => {
      if (!sound) return Promise.reject(new Error('Sound instance unmounted'));
      if (sound.playing()) return Promise.resolve();

      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        await Howler.ctx.resume().catch(() => {});
      }

      return new Promise((resolve, reject) => {
        sound.once('play', () => {
          resolve();
        });
        sound.once('playerror', (_id, err) => {
          console.warn('[howler] Play error:', err);
          reject(err);
        });

        const id = sound.play();
        if (!id && id !== 0) {
          reject(new Error('Howler play failed'));
        }
      });
    },

    pause: () => {
      if (sound) {
        sound.stop();
      }
    },

    unload: () => {
      if (sound) {
        sound.stop();
        sound.unload();
        sound = null;
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
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume().catch(() => {});
    }

    const ctx = Howler.ctx;
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
