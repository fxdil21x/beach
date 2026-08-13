const styles = {
  OPEN: 'bg-amber-500/15 text-amber-300',
  IN_PROGRESS: 'bg-sky-500/15 text-sky-300',
  RESOLVED: 'bg-emerald-500/15 text-emerald-300',
  GRANTED: 'bg-emerald-500/15 text-emerald-300',
  DENIED: 'bg-rose-500/15 text-rose-300',
  active: 'bg-emerald-500/15 text-emerald-300',
  disabled: 'bg-zinc-700/60 text-zinc-300',
  master: 'bg-zinc-700/60 text-zinc-300',
};

export default function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || 'bg-zinc-700/60 text-zinc-300'
      }`}
    >
      {label || status}
    </span>
  );
}
