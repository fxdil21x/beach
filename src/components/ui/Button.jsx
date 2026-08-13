export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClass =
    'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold leading-snug break-words whitespace-normal transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 border border-gray-200',
  };

  return (
    <button
      type={type}
      className={`${baseClass} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
