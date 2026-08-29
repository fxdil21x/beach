import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpRight, Check } from 'lucide-react';

export default function TrafficFlowAreaChart({
  title = 'Footfall Flow',
  total = 9642,
  formattedTotal,
  growth = '+10.2%',
  growthLabel = 'vs last month',
  flowData = [],
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

  const data = flowData && flowData.length > 0
    ? flowData
    : [
        { label: 'Day 1', value: 0 },
        { label: 'Day 2', value: 0 },
        { label: 'Day 3', value: 0 },
        { label: 'Day 4', value: 0 },
        { label: 'Day 5', value: 0 },
        { label: 'Day 6', value: 0 },
        { label: 'Day 7', value: 0 },
      ];

  const svgWidth = 320;
  const svgHeight = 110;
  const highestVal = Math.max(...data.map((d) => d.value), 0);
  const maxVal = Math.max(highestVal > 0 ? highestVal * 1.2 : 10, 10);
  const yTicks = [
    Math.round(maxVal),
    Math.round(maxVal * 0.66),
    Math.round(maxVal * 0.33),
    0,
  ];

  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * svgWidth;
    const y = svgHeight - (d.value / maxVal) * (svgHeight - 16) - 8;
    return { x, y, ...d };
  });

  // Spline Path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  // Find peak point for badge
  const peakPoint = points.find((p) => p.isPeak) || points[6] || points[points.length - 1];

  const displayTotal = formattedTotal || (typeof total === 'number' ? total.toLocaleString() : total);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-lg shadow-black/20 transition-all hover:border-zinc-700/90">
      {/* Header & Filter */}
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
              {['This Month', 'Today', 'All Time'].map((p) => (
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

      {/* Main Count & Trend */}
      <div className="mt-2.5">
        <div className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {displayTotal}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium">
          <span className="inline-flex items-center gap-0.5 text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {growth}
          </span>
          <span className="text-zinc-500">{growthLabel}</span>
        </div>
      </div>

      {/* Area Wave Chart with Y-Axis & X-Axis */}
      <div className="relative mt-4">
        {/* Peak Floating Orange Pill Tooltip */}
        {peakPoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-1 transition-all duration-200"
            style={{
              left: `${(peakPoint.x / svgWidth) * 100}%`,
              top: `${(peakPoint.y / svgHeight) * 100}%`,
            }}
          >
            <div className="rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/20">
              {peakPoint.value.toLocaleString()}
            </div>
          </div>
        )}

        <div className="flex">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between pr-2 text-[9px] font-medium text-zinc-500" style={{ height: svgHeight }}>
            <span>{yTicks[0] >= 1000 ? `${(yTicks[0] / 1000).toFixed(1)}k` : yTicks[0]}</span>
            <span>{yTicks[1] >= 1000 ? `${(yTicks[1] / 1000).toFixed(1)}k` : yTicks[1]}</span>
            <span>{yTicks[2] >= 1000 ? `${(yTicks[2] / 1000).toFixed(1)}k` : yTicks[2]}</span>
            <span>0</span>
          </div>

          {/* SVG Canvas */}
          <div className="relative flex-1" style={{ height: svgHeight }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="flow-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area Fill */}
              <path d={fillD} fill="url(#flow-area-grad)" />

              {/* Glowing Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#EA580C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Peak glowing indicator circle */}
              {peakPoint && (
                <circle
                  cx={peakPoint.x}
                  cy={peakPoint.y}
                  r="3.5"
                  className="fill-white stroke-orange-500 stroke-2"
                />
              )}
            </svg>
          </div>
        </div>

        {/* X-Axis Dates */}
        <div className="mt-2 flex justify-between pl-6 text-[10px] font-medium text-zinc-500">
          {data.map((d, i) => (
            <span key={d.label || i}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
