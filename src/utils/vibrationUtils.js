// Browser Vibration API utilities

let vibrationIntervalId = null;
let userHasInteracted = false;

// Track first user gesture globally so we never call vibrate(0) before interaction
if (typeof window !== 'undefined') {
  const markInteracted = () => { userHasInteracted = true; };
  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, markInteracted, { once: false, passive: true, capture: true });
  });
}

/**
 * Checks if Vibration API is supported by the browser.
 */
export function isVibrationSupported() {
  return typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function';
}

/**
 * Gives short 200ms vibration feedback to user when clicking Emergency button.
 */
export function triggerUserFeedbackVibration() {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(200);
    } catch (e) {
      console.warn('Vibration API error:', e);
    }
  }
}

/**
 * Pattern: Vibrate 500ms, Pause 300ms, Vibrate 500ms, Pause 300ms, Vibrate 1000ms
 * Pattern total time = 500 + 300 + 500 + 300 + 1000 = 2600ms + 300ms pause = 2900ms cycle
 */
const EMERGENCY_VIBRATION_PATTERN = [500, 300, 500, 300, 1000];
const VIBRATION_CYCLE_MS = 2900;

/**
 * Starts continuous emergency vibration pattern loop until stopped.
 */
export function startEmergencyVibrationLoop() {
  if (!isVibrationSupported()) return;

  // Stop any existing loop first
  stopEmergencyVibration();

  const triggerPattern = () => {
    try {
      navigator.vibrate(EMERGENCY_VIBRATION_PATTERN);
    } catch {
      // Ignore
    }
  };

  triggerPattern();
  vibrationIntervalId = setInterval(triggerPattern, VIBRATION_CYCLE_MS);
}

/**
 * Stops all vibration immediately.
 */
export function stopEmergencyVibration() {
  if (vibrationIntervalId !== null) {
    clearInterval(vibrationIntervalId);
    vibrationIntervalId = null;
  }
  // Only call vibrate(0) if the user has already interacted — Chrome blocks it otherwise
  if (isVibrationSupported() && userHasInteracted) {
    try {
      navigator.vibrate(0);
    } catch {
      // Ignore intervention errors silently
    }
  }
}
