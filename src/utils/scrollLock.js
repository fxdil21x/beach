import { useEffect } from 'react';

let lockCount = 0;
let previousBodyOverflow = '';

/**
 * Locks document.body scrolling when a modal or overlay is open.
 */
export function lockScroll() {
  lockCount++;
  if (lockCount === 1 && typeof document !== 'undefined') {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Unlocks document.body scrolling when all modals/overlays are closed.
 */
export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow || '';
  }
}

/**
 * React hook to lock background scroll when `isOpen` is true.
 */
export function useModalScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isOpen]);
}
