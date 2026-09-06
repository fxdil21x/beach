import { useEffect } from 'react';

let lockCount = 0;
let previousBodyOverflow = '';
let previousBodyTouchAction = '';

/**
 * Universally locks background page scrolling when a modal or overlay is open.
 * Supports both standard mobile/desktop browsers and iPhone mockup device frames.
 */
export function lockScroll() {
  lockCount++;
  if (lockCount === 1 && typeof document !== 'undefined') {
    previousBodyOverflow = document.body.style.overflow;
    previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const deviceRoots = document.querySelectorAll('.device-app-root');
    deviceRoots.forEach((el) => {
      el.setAttribute('data-modal-active', 'true');
    });
  }
}

/**
 * Unlocks background page scrolling when all modals/overlays are closed.
 */
export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow || '';
    document.body.style.touchAction = previousBodyTouchAction || '';

    const deviceRoots = document.querySelectorAll('.device-app-root');
    deviceRoots.forEach((el) => {
      el.removeAttribute('data-modal-active');
    });
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
