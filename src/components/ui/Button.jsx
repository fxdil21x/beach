export default function Button({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClass =
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] shadow-sm select-none cursor-pointer';

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 border border-slate-200/80 dark:border-slate-700',
    outline: 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 dark:active:bg-slate-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-red-500/20',
    ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-none',
    link: 'text-blue-600 underline-offset-4 hover:underline shadow-none p-0 h-auto',
  };

  const sizes = {
    default: 'h-11 px-4 py-2.5',
    sm: 'h-9 px-3 text-xs rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
    icon: 'h-9 w-9 p-0 rounded-xl',
  };

  const selectedVariant = variants[variant] || variants.default;
  const selectedSize = sizes[size] || sizes.default;

  return (
    <button
      type={type}
      className={`${baseClass} ${selectedVariant} ${selectedSize} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
