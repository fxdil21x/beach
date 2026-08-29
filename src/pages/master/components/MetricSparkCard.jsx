import { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricSparkCard({
  title,
  value,
  formattedValue,
  trend = '+12.5%',
  trendLabel = 'from last month',
  isPositive = true,
  icon: Icon,
  accentColor = 'orange', // 'orange' | 'green' | 'amber' | 'gold'
  sparklineData = [20, 35, 25, 45, 30, 55, 40, 65, 50, 70],
  allowHide = false,
}) {
  const [isHidden, setIsHidden] = useState(false);

  // Define accent styles based on color
  const colorMap = {
    orange: {
      iconBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      stroke: '#F97316',
      fillStart: 'rgba(249, 115, 22, 0.25)',
      fillEnd: 'rgba(249, 115, 22, 0.0)',
      trendText: isPositive ? 'text-emerald-400' : 'text-rose-400',
    },
    green: {
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      stroke: '#10B981',
      fillStart: 'rgba(16, 185, 129, 0.25)',
      fillEnd: 'rgba(16, 185, 129, 0.0)',
      trendText: isPositive ? 'text-emerald-400' : 'text-rose-400',
    },
    amber: {
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      stroke: '#F59E0B',
      fillStart: 'rgba(245, 158, 11, 0.25)',
      fillEnd: 'rgba(245, 158, 11, 0.0)',
      trendText: isPositive ? 'text-emerald-400' : 'text-rose-400',
    },
    gold: {
      iconBg: 'bg-orange-600/15 border-orange-600/30 text-orange-400',
      stroke: '#EA580C',
      fillStart: 'rgba(234, 88, 12, 0.25)',
      fillEnd: 'rgba(234, 88, 12, 0.0)',
      trendText: isPositive ? 'text-emerald-400' : 'text-rose-400',
    },
  };

  const currentTheme = colorMap[accentColor] || colorMap.orange;

  // Build SVG Path from data
  const width = 280;
  const height = 48;
  const maxVal = Math.max(...sparklineData, 1);
  const minVal = Math.min(...sparklineData, 0);
  const range = maxVal - minVal || 1;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 12) - 6;
    return { x, y };
  });

  // Smooth curve using cubic bezier control points
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

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `spark-grad-${accentColor}-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const displayVal = isHidden
    ? '••••••••'
    : (formattedValue !== undefined ? formattedValue : (typeof value === 'number' ? value.toLocaleString() : value));

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-lg shadow-black/20 transition-all hover:border-zinc-700/90">
      <div>
        {/* Card Header: Title & Accent Icon */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <span>{title}</span>
            {allowHide && (
              <button
                type="button"
                onClick={() => setIsHidden((prev) => !prev)}
                className="text-zinc-500 hover:text-zinc-300"
                aria-label="Toggle visibility"
              >
                {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${currentTheme.iconBg}`}>
            {Icon && <Icon className="h-4 w-4" strokeWidth={2.2} />}
          </div>
        </div>

        {/* Large Value Display */}
        <div className="mt-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {displayVal}
          </h2>
        </div>

        {/* Trend Indicator */}
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span className={`inline-flex items-center gap-0.5 ${currentTheme.trendText}`}>
            {isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend}
          </span>
          <span className="text-zinc-500">{trendLabel}</span>
        </div>
      </div>

      {/* Mini Glowing Sparkline Wave */}
      <div className="mt-3.5 -mx-5 -mb-5 h-12 w-[calc(100%+2.5rem)] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible preserve-3d"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentTheme.stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={currentTheme.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Shaded Area */}
          <path d={fillD} fill={`url(#${gradId})`} />
          {/* Glowing Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={currentTheme.stroke}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
