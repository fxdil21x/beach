import { X } from 'lucide-react';

export default function CommonModal({
  isOpen,
  onClose,
  icon: IconComponent,
  iconBg = 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  title,
  subtitle,
  maxWidth = 'max-w-md',
  children,
  actions,
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-[85vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100/90 text-slate-900 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || IconComponent) && (
          <div className="flex items-start justify-between border-b border-slate-100 bg-white p-5 shrink-0">
            <div className="flex items-start gap-3.5 min-w-0">
              {IconComponent && (
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-inner`}>
                  {typeof IconComponent === 'function' || typeof IconComponent === 'object' && IconComponent.render ? (
                    <IconComponent className="h-5 w-5" />
                  ) : (
                    IconComponent
                  )}
                </div>
              )}
              <div className="space-y-0.5 min-w-0">
                {title && (
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="border-t border-slate-100 bg-slate-50/80 p-4 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
