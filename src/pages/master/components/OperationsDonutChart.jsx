import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function OperationsDonutChart({
  title = 'Operations Breakdown',
  totalLabel = 'Total Entries',
  totalOps = 12347,
  formattedTotal,
  breakdown = [],
  onPeriodChange = () => {},
}) {
  const [period, setPeriod] = useState('This Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultBreakdown = [
    { name: 'Resident Pass Entries', count: 3200, percent: 25.9, color: '#F97316' },
    { name: 'General Visitor Entries', count: 2850, percent: 23.1, color: '#FB923C' },
    { name: 'Active Resident Passes', count: 2450, percent: 19.8, color: '#F59E0B' },
    { name: 'Beach Incident Reports', count: 2100, percent: 17.0, color: '#C2410C' },
    { name: 'Admin & System Actions', count: 1747, percent: 14.2, color: '#78350F' },
  ];

  const items = breakdown && breakdown.length > 0 ? breakdown : defaultBreakdown;
  const totalCount = items.reduce((acc, curr) => acc + (curr.count || 0), 0) || totalOps;

  // Build SVG Donut Segments
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const displayTotal = formattedTotal || (typeof totalCount === 'number' ? totalCount.toLocaleString() : totalCount);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-lg shadow-black/20 transition-all hover:border-zinc-700/90">
      {/* Header & Filter Dropdown */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 sm:text-base">{title}</h3>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            <span>{period}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-zinc-800 bg-[#18181b] p-1 shadow-2xl backdrop-blur">
              {['This Month', 'This Year', 'All Time'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPeriod(p);
                    onPeriodChange(p);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${
                    period === p ? 'bg-orange-500/15 text-orange-400 font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{p}</span>
                  {period === p && <Check className="h-3 w-3 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donut Chart & Structured Legend */}
      <div className="mt-5 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
        {/* SVG Donut Ring (5 cols) */}
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center sm:col-span-5">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            {/* Background track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth="15"
            />
            {/* Colored Segments */}
            {items.map((item, idx) => {
              const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percent;

              return (
                <circle
                  key={item.name || idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="15"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-bold tracking-tight text-white sm:text-base">
              {displayTotal}
            </span>
            <span className="text-[10px] font-medium text-zinc-500">{totalLabel}</span>
          </div>
        </div>

        {/* Legend List (7 cols) */}
        <div className="space-y-2.5 sm:col-span-7">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate font-medium text-zinc-400">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-zinc-200">
                  {typeof item.count === 'number' ? item.count.toLocaleString() : item.count}
                </span>
                <span className="w-10 text-right text-[11px] font-medium text-zinc-500">
                  {item.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
