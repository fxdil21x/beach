import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartColumn, Ticket, Users } from 'lucide-react';
import * as masterApi from '../../api/masterApi.js';

export default function Analytics() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    masterApi.getAnalytics().then(({ data }) => setAnalytics(data.data.analytics)).catch(() => {});
  }, []);

  if (!analytics) return null;

  const visitorStats = [
    { label: 'Today', value: analytics.visitors.today },
    { label: 'Week', value: analytics.visitors.week },
    { label: 'Month', value: analytics.visitors.month },
  ];

  const residentStats = [
    { label: 'Today', value: analytics.residents.today },
    { label: 'Week', value: analytics.residents.week },
    { label: 'Month', value: analytics.residents.month },
    { label: 'Registered', value: analytics.residents.totalRegistered },
    { label: 'With Photos', value: analytics.residents.withPhotos },
    { label: 'Active Passes', value: analytics.residents.activePasses },
  ];

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('nav.analytics')}</h1>
        <p className="mt-1 text-sm text-zinc-500">Visitor and resident performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Ticket className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-white">Visitors</h2>
          </div>
          <div className="space-y-3">
            {visitorStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-zinc-950/50 px-3 py-2">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <span className="text-lg font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="font-bold text-white">Residents</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {residentStats.map((item) => (
              <div key={item.label} className="rounded-xl bg-zinc-950/50 px-3 py-3">
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
        <div className="mb-2 flex items-center gap-2 text-zinc-300">
          <ChartColumn className="h-4 w-4 text-sky-400" />
          <p className="text-sm font-medium">Overview</p>
        </div>
        <p className="text-sm text-zinc-500">
          Totals update from live beach entry and registration activity.
        </p>
      </div>
    </div>
  );
}
