import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function ImageModal({ src, alt = 'Preview image', onClose }) {
  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!src) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const deviceLayer = window.__deviceModalLayer;
    setPortalTarget(deviceLayer || document.body);
  }, [src]);

  useEffect(() => {
    if (!src) {
      resolvedRef.current = false;
      setPortalTarget(null);
    }
  }, [src]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (src) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [src, onClose]);

  if (!src || !portalTarget) return null;

  return createPortal(
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90%] max-w-[95%] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Close Button Only */}
        <div className="mb-2 flex w-full justify-end px-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-red-600 hover:scale-105 active:scale-95 focus:outline-none shadow-lg cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* High Quality Image Preview */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40">
          <img
            src={src}
            alt={alt}
            className="max-h-[75vh] max-w-[85vw] object-contain select-none"
          />
        </div>
      </div>
    </div>,
    portalTarget
  );
}

