import { useTranslation } from 'react-i18next';

export default function VisitorCounter({ value, onChange, min = 1, max = 50 }) {
  const { t } = useTranslation();

  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="mb-4 text-center font-medium text-gray-700">{t('visitor.groupSize')}</p>
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={decrement}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-4xl font-bold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={increment}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
