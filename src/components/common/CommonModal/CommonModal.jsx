import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * CommonModal — shared modal component used by:
 *  - NotificationBell modal  (orange accent, "Close" button)
 *  - Location consent modal  (emerald accent, "Allow / Not Now" buttons)
 *
 * Props:
 *  isOpen          — boolean to show/hide
 *  onClose         — called on backdrop click or X button
 *  icon            — Lucide icon component
 *  iconBg          — tailwind classes for icon container background
 *  title           — modal heading
 *  subtitle        — subheading below title
 *  maxWidth        — tailwind max-width class (default: max-w-md)
 *  children        — modal body content
 *  actions         — custom footer JSX (overrides actionLabel/onAction)
 *  actionLabel     — primary action button label (used if no actions prop)
 *  onAction        — primary action callback
 *  actionBtnClass  — tailwind classes for the primary button background/shadow
 *  showCloseButton — show X in header (default: true)
 */
export default function CommonModal({
  isOpen,
  onClose,
  icon: IconComponent,
  iconBg = 'bg-slate-100 text-slate-600 border border-slate-200',
  title,
  subtitle,
  maxWidth = 'max-w-md',
  children,
  actions,
  actionLabel = 'Close',
  onAction,
  actionBtnClass = 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20',
  showCloseButton = true,
}) {
  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  // Resolve portal target each time modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    // Use device-modal-layer if in mockup desktop mode, else body
    const deviceLayer = window.__deviceModalLayer;
    setPortalTarget(deviceLayer || document.body);
  }, [isOpen]);

  // Reset resolved flag on close so next open re-resolves
  useEffect(() => {
    if (!isOpen) {
      resolvedRef.current = false;
      setPortalTarget(null);
    }
  }, [isOpen]);

  if (!isOpen || !portalTarget) return null;

  const footerActions = actions ?? (
    <button
      type="button"
      onClick={onAction ?? onClose}
      className={`w-full rounded-xl py-3 text-xs font-bold text-white shadow-md flex items-center justify-center transition-all active:scale-[0.99] cursor-pointer ${actionBtnClass}`}
    >
      {actionLabel}
    </button>
  );

  const modal = (
    <div
      className="absolute inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{
        background: 'rgba(2,6,23,0.72)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-[calc(100%-2rem)] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 text-slate-900 animate-in zoom-in-95 slide-in-from-bottom-3 duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        {(title || IconComponent) && (
          <div className="flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 shrink-0">
            <div className="flex items-start gap-3.5 min-w-0">
              {IconComponent && (
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                  {typeof IconComponent === 'function' || (IconComponent && typeof IconComponent === 'object' && IconComponent.$$typeof) ? (
                    <IconComponent className="h-5 w-5" />
                  ) : (
                    IconComponent
                  )}
                </div>
              )}
              <div className="space-y-0.5 min-w-0 pt-0.5">
                {title && (
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 ml-2 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {children}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-100 bg-white px-4 py-3.5 shrink-0">
          {footerActions}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, portalTarget);
}
