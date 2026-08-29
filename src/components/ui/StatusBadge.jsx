import { useFeatureSettings } from '../../context/FeatureContext.jsx';

const styles = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200/80',
  IN_PROGRESS: '',
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

export default function StatusBadge({ status, label, className = '', style: customStyle }) {
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const accentColor = appearance.accentColor || '#0284C7';

  const defaultStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const isDynamicProgress = status === 'IN_PROGRESS';

  const dynamicInlineStyle = isDynamicProgress
    ? {
        backgroundColor: `${accentColor}18`,
        color: accentColor,
        borderColor: `${accentColor}35`,
        ...customStyle,
      }
    : customStyle;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors shadow-2xs ${
        isDynamicProgress ? '' : defaultStyle
      } ${className}`}
      style={dynamicInlineStyle}
    >
      {label || status}
    </span>
  );
}
