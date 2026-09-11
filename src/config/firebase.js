import { initializeApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Ensures a container exists in the DOM and initializes invisible reCAPTCHA
 */
export function getRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[Firebase SMS Auth] reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.warn('[Firebase SMS Auth] reCAPTCHA expired, resetting');
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch {
            // ignore
          }
          window.recaptchaVerifier = null;
        }
      },
    });
  }

  return window.recaptchaVerifier;
}

/**
 * Send real SMS OTP to the entered phone number via Firebase
 * @param {string} phone - 10-digit Indian phone number (e.g. 7025715250)
 */
export async function sendFirebaseOtp(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const formatted = cleaned.startsWith('91') && cleaned.length === 12
    ? `+${cleaned}`
    : `+91${cleaned.slice(-10)}`;

  console.log(`[Firebase SMS Auth] Sending direct SMS OTP to ${formatted}...`);
  const verifier = getRecaptchaVerifier('recaptcha-container');
  const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
  window.confirmationResult = confirmationResult;
  console.log(`[Firebase SMS Auth] SMS OTP dispatched successfully to ${formatted}`);
  return confirmationResult;
}

/**
 * Confirm 6-digit OTP code entered by user
 * @param {string} otpCode
 */
export async function confirmFirebaseOtp(otpCode) {
  if (!window.confirmationResult) {
    return null;
  }
  const result = await window.confirmationResult.confirm(otpCode);
  return result.user;
}

export default auth;
