import { BadgeCheck, Ticket, UserPlus, TriangleAlert, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentActivityFeed({
  title = 'Recent Activity',
  activities = [],
  viewAllLink = '/master/resident-entries',
}) {
  const navigate = useNavigate();

  const iconMap = {
    BadgeCheck: {
      icon: BadgeCheck,
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    Ticket: {
      icon: Ticket,
      bg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    },
    UserPlus: {
      icon: UserPlus,
      bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    },
    TriangleAlert: {
      icon: TriangleAlert,
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    Shield: {
      icon: Shield,
      bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    },
  };

  const defaultActivities = [
    {
      id: '1',
      title: 'Resident Pass Check-in',
      subtitle: 'May 22, 2025 • 10:30 AM',
      tag: '+1 Entry',
      tagType: 'success',
      status: 'Completed',
      icon: 'BadgeCheck',
    },
    {
      id: '2',
      title: 'Visitor Pass (4 guests)',
      subtitle: 'May 22, 2025 • 09:15 AM',
      tag: '+4 Visitors',
      tagType: 'success',
      status: 'Completed',
      icon: 'Ticket',
    },
    {
      id: '3',
      title: 'New Resident Registered',
      subtitle: 'May 21, 2025 • 08:45 PM',
      tag: 'New Pass',
      tagType: 'success',
      status: 'Completed',
      icon: 'UserPlus',
    },
    {
      id: '4',
      title: 'Lifeguard Inspection Log',
      subtitle: 'May 21, 2025 • 06:20 PM',
      tag: 'Report',
      tagType: 'warning',
      status: 'Completed',
      icon: 'TriangleAlert',
    },
  ];

  const items = activities || [];

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

      {/* Activity List or Empty State */}
      <div className="mt-4 space-y-3.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BadgeCheck className="h-8 w-8 text-zinc-600" />
            <p className="mt-2 text-xs font-medium text-zinc-400">No activity recorded today</p>
            <p className="text-[11px] text-zinc-600">New entries and scans will appear here live</p>
          </div>
        ) : (
          items.slice(0, 4).map((item) => {
            const config = iconMap[item.icon] || iconMap.BadgeCheck;
            const IconComponent = config.icon;

            return (
              <div key={item.id} className="flex items-center justify-between gap-3">
                {/* Left: Icon & Title/Subtitle */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.bg}`}>
                    <IconComponent className="h-4 w-4" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-200">
                      {item.title}
                    </p>
                    <p className="truncate text-[11px] text-zinc-500">{item.subtitle}</p>
                  </div>
                </div>

                {/* Right: Tag & Status */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-xs font-bold ${
                      item.tagType === 'success'
                        ? 'text-emerald-400'
                        : item.tagType === 'warning'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {item.tag}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-500/80">
                    {item.status}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
