import React from 'react';

export function Alert({ children, variant = 'default', className = '' }) {
  const variantStyles = {
    default: 'bg-white text-slate-900 border-slate-200',
    destructive: 'bg-red-50 text-red-900 border-red-200/80',
    warning: 'bg-amber-50 text-amber-900 border-amber-200/80',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
  };

  return (
    <div
      role="alert"
      className={`relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-sm shadow-xs transition-all ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '' }) {
  return <h5 className={`font-bold text-xs sm:text-sm leading-none tracking-tight ${className}`}>{children}</h5>;
}

export function AlertDescription({ children, className = '' }) {
  return <div className={`text-xs font-medium leading-relaxed mt-1 opacity-90 ${className}`}>{children}</div>;
}
