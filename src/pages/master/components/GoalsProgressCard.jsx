import { Target, CreditCard, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GoalsProgressCard({
  title = 'Goals Progress',
  goals = [],
  viewAllLink = '/master/analytics',
}) {
  const navigate = useNavigate();

  const iconMap = {
    Target: {
      icon: Target,
      bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      bar: 'from-orange-600 to-orange-400',
    },
    CreditCard: {
      icon: CreditCard,
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      bar: 'from-amber-600 to-orange-400',
    },
    TrendingUp: {
      icon: TrendingUp,
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      bar: 'from-emerald-600 to-teal-400',
    },
    ShieldCheck: {
      icon: ShieldCheck,
      bg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
      bar: 'from-sky-600 to-cyan-400',
    },
  };

  const defaultGoals = [
    {
      id: 'footfall',
      title: 'Monthly Beach Footfall Target',
      formattedCurrent: '86,420',
      formattedTarget: '100,000',
      percent: 86,
      icon: 'Target',
    },
    {
      id: 'photo_verification',
      title: 'Resident Photo Verification Rate',
      formattedCurrent: '12,347',
      formattedTarget: '15,000',
      percent: 82,
      icon: 'CreditCard',
    },
    {
      id: 'report_resolution',
      title: 'Incident Resolution & Safety',
      formattedCurrent: '11,337',
      formattedTarget: '20,000',
      percent: 57,
      icon: 'TrendingUp',
    },
  ];

  const items = goals && goals.length > 0 ? goals : defaultGoals;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-lg shadow-black/20 transition-all hover:border-zinc-700/90">
      {/* Header & View All */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 sm:text-base">{title}</h3>
        <button
          type="button"
          onClick={() => navigate(viewAllLink)}
          className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition hover:text-orange-400"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Goals Progress Items */}
      <div className="mt-4 space-y-4">
        {items.map((item) => {
          const config = iconMap[item.icon] || iconMap.Target;
          const IconComponent = config.icon;

          return (
            <div key={item.id || item.title} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${config.bg}`}>
                    <IconComponent className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </div>
                  <span className="truncate text-xs font-medium text-zinc-300">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <span className="font-semibold text-zinc-300">
                    {item.formattedCurrent || (typeof item.current === 'number' ? item.current.toLocaleString() : item.current)}
                    <span className="text-zinc-500 font-normal">
                      {' '}/ {item.formattedTarget || (typeof item.target === 'number' ? item.target.toLocaleString() : item.target)}
                    </span>
                  </span>
                  <span className="w-8 text-right font-bold text-white">
                    {item.percent}%
                  </span>
                </div>
              </div>

              {/* Progress Track & Fill */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/90">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${config.bar} shadow-sm shadow-orange-500/20 transition-all duration-700`}
                  style={{ width: `${Math.min(100, Math.max(2, item.percent))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
