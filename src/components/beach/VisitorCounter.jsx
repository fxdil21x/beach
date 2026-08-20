import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Users, Ticket } from 'lucide-react';

export default function VisitorCounter({ value, onChange, min = 1, max = 50, pricePerPerson = 20 }) {
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);

  const triggerAnimation = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 200);
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
      triggerAnimation();
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
      triggerAnimation();
    }
  };

  const totalPrice = value * pricePerPerson;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300">
      {/* Group Size Title Header */}
      <div className="flex items-center justify-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
          <Users className="h-4.5 w-4.5" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {t('visitor.groupSize', 'Group Size / Visitor Count')}
        </h3>
      </div>

      {/* Counter Controls Row */}
      <div className="flex items-center justify-center gap-6 my-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-2xs transition-all duration-150 hover:bg-slate-100 hover:border-slate-300 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Decrease visitor count"
        >
          <Minus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <div className="flex flex-col items-center justify-center min-w-[5rem] select-none">
          <span
            className={`text-3xl sm:text-3xl font-500 text-slate-900 tracking-tight transition-transform duration-200 ${
              animate ? 'scale-110 text-cyan-600' : 'scale-100'
            }`}
          >
            {value}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
            {value === 1 ? 'Person' : 'Persons'}
          </span>
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 transition-all duration-150 hover:from-cyan-400 hover:to-blue-500 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Increase visitor count"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Lightweight Calculation Line */}
      <div className="mt-4 pt-3.5 flex items-center justify-between border-t border-slate-100 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Ticket className="h-4 w-4 text-cyan-600 shrink-0" />
          <span>₹{pricePerPerson} × {value} {value === 1 ? 'person' : 'persons'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 font-medium uppercase">Total:</span>
          <span className="text-base font-extrabold text-slate-900">₹{totalPrice}</span>
        </div>
      </div>
    </div>
  );
}



