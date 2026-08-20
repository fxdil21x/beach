const styles = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200/80',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200/80',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  GRANTED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  DENIED: 'bg-rose-50 text-rose-700 border-rose-200/80',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  disabled: 'bg-slate-100 text-slate-600 border-slate-200',
  master: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function StatusBadge({ status, label, className = '' }) {
  const style = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors shadow-2xs ${style} ${className}`}
    >
      {label || status}
    </span>
  );
}
