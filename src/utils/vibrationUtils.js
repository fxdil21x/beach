// Browser Vibration API utilities

let vibrationIntervalId = null;

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
  if (isVibrationSupported()) {
    try {
      const res = navigator.vibrate(0);
      if (res === false) {
        // Suppress Chrome intervention warning
      }
    } catch {
      // Ignore intervention errors
    }
  }
}
