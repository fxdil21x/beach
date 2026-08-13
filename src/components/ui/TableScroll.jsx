export default function TableScroll({ children, className = '' }) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-auto rounded-2xl border border-zinc-800 bg-zinc-900/80 ${className}`}
    >
      {children}
    </div>
  );
}
