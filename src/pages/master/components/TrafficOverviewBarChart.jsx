import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpRight, Check } from 'lucide-react';

export default function TrafficOverviewBarChart({
  title = 'Traffic & Entries Overview',
  total = 86420,
  formattedTotal,
  growth = '+15.6%',
  growthLabel = 'vs last year',
  monthlyData = [],
  onPeriodChange = () => {},
}) {
  const [period, setPeriod] = useState('This Year');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = monthlyData && monthlyData.length > 0
    ? monthlyData
    : monthNames.map((m) => ({ month: m, value: 0 }));

  // Find peak / default active callout
  const currentMonthIdx = new Date().getMonth();
  const peakIndex = data.findIndex((d) => d.isPeak);
  const activeIndex = hoveredIdx !== null
    ? hoveredIdx
    : (peakIndex >= 0 ? peakIndex : currentMonthIdx);
  const activeItem = data[activeIndex] || data[currentMonthIdx] || data[0];

  const highestDataVal = Math.max(...data.map((d) => d.value), 0);
  const maxVal = Math.max(highestDataVal > 0 ? highestDataVal * 1.25 : 10, 10);

  // Dynamic Y-axis ticks based on real numbers
  const yTicks = [
    Math.round(maxVal),
    Math.round(maxVal * 0.66),
    Math.round(maxVal * 0.33),
    0,
  ];
  const chartHeight = 160;

  const displayTotal = formattedTotal || (typeof total === 'number' ? total.toLocaleString() : total);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-lg shadow-black/20 transition-all hover:border-zinc-700/90">
      {/* Header with Title & Period Filter */}
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
              {['This Year', 'This Month', 'This Week'].map((p) => (
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

      {/* Main Aggregated Value & Trend */}
      <div className="mt-3">
        <p className="text-xs font-medium text-zinc-400">Total Entries</p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {displayTotal}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {growth} <span className="font-normal text-zinc-500">{growthLabel}</span>
          </span>
        </div>
      </div>

      {/* Interactive Bar Chart Area */}
      <div className="relative mt-6">
        {/* Active / Peak Floating Pin Callout Tooltip */}
        {activeItem && (
          <div
            className="pointer-events-none absolute -top-8 z-20 -translate-x-1/2 transition-all duration-150"
            style={{
              left: `${((activeIndex + 0.5) / data.length) * 100}%`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="flex flex-col items-center rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 shadow-xl ring-1 ring-white/10">
                <span className="text-[9px] font-medium text-zinc-400">{activeItem.month} 2026</span>
                <span className="text-xs font-bold text-white">{activeItem.value.toLocaleString()}</span>
              </div>
              <div className="h-2 w-2 -mt-1 rotate-45 border-b border-r border-zinc-700 bg-zinc-950" />
            </div>
          </div>
        )}

        <div className="flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between pr-3 text-[10px] font-medium text-zinc-500" style={{ height: chartHeight }}>
            <span>{yTicks[0] >= 1000 ? `${(yTicks[0] / 1000).toFixed(1)}k` : yTicks[0]}</span>
            <span>{yTicks[1] >= 1000 ? `${(yTicks[1] / 1000).toFixed(1)}k` : yTicks[1]}</span>
            <span>{yTicks[2] >= 1000 ? `${(yTicks[2] / 1000).toFixed(1)}k` : yTicks[2]}</span>
            <span>0</span>
          </div>

          {/* Chart Columns & Grid Lines */}
          <div className="relative flex-1" style={{ height: chartHeight }}>
            {/* Grid horizontal lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
              <div className="border-b border-zinc-500" />
              <div className="border-b border-zinc-500" />
              <div className="border-b border-zinc-500" />
              <div className="border-b border-zinc-500" />
            </div>

            {/* Columns */}
            <div className="relative flex h-full items-end justify-between gap-1 sm:gap-2 px-1">
              {data.map((item, idx) => {
                const heightPercent = Math.max(8, Math.min(100, Math.round((item.value / maxVal) * 85)));
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={item.month || idx}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Vertical guideline for active item */}
                    {isActive && (
                      <div className="absolute top-0 bottom-0 w-[1px] bg-orange-500/40 pointer-events-none" />
                    )}

                    {/* Bar Pill with Orange Glow */}
                    <div
                      className={`w-full max-w-[20px] rounded-t-md transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 shadow-md shadow-orange-500/40 ring-1 ring-orange-400/80 scale-105'
                          : 'bg-gradient-to-t from-orange-600/70 to-orange-500/90 hover:from-orange-500 hover:to-orange-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Top Pin Dot for active item */}
                      {isActive && (
                        <div className="mx-auto -mt-1 h-2 w-2 rounded-full border-2 border-zinc-950 bg-white ring-2 ring-orange-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-Axis Month Labels */}
        <div className="mt-2.5 flex justify-between pl-8 pr-1 text-[11px] font-medium text-zinc-500">
          {data.map((item) => (
            <span key={item.month} className="flex-1 text-center truncate">
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
