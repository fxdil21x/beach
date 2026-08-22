import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import {
  Users,
  Ticket,
  BadgeCheck,
  UserRound,
  Shield,
  UserPlus,
  TriangleAlert,
  Footprints,
} from 'lucide-react';
import MasterSidebar from '../../components/layout/MasterSidebar.jsx';
import MasterHeader from '../../components/layout/MasterHeader.jsx';
import PageContainer from '../../components/layout/PageContainer.jsx';
import AdminEmergencyOverlay from '../../components/notifications/AdminEmergencyOverlay.jsx';
import { MasterDashboardSkeleton } from '../../components/ui/Skeleton.jsx';
import * as masterApi from '../../api/masterApi.js';

export function MasterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <AdminEmergencyOverlay />
      <MasterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <MasterHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  );
}

const metricMeta = [
  { key: 'totalEntriesToday', labelKey: 'master.totalEntriesToday', icon: Footprints, accent: 'text-sky-400 bg-sky-500/15' },
  { key: 'generalVisitorsToday', labelKey: 'master.generalVisitorsToday', icon: Ticket, accent: 'text-violet-400 bg-violet-500/15' },
  { key: 'residentFreeEntriesToday', labelKey: 'master.residentEntriesToday', icon: BadgeCheck, accent: 'text-emerald-400 bg-emerald-500/15' },
  { key: 'totalRegisteredResidents', labelKey: 'master.totalRegistered', icon: Users, accent: 'text-orange-400 bg-orange-500/15' },
  { key: 'totalUsers', labelKey: 'master.totalUsers', icon: UserRound, accent: 'text-blue-400 bg-blue-500/15' },
  { key: 'totalAdmins', labelKey: 'master.totalAdmins', icon: Shield, accent: 'text-rose-400 bg-rose-500/15' },
  { key: 'newResidentRegistrations', labelKey: 'master.newRegistrations', icon: UserPlus, accent: 'text-cyan-400 bg-cyan-500/15' },
  { key: 'beachReports', labelKey: 'master.openReports', icon: TriangleAlert, accent: 'text-amber-400 bg-amber-500/15' },
];

export default function MasterDashboard() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);

  const load = useCallback(() => {
    masterApi.getDashboard().then(({ data }) => setMetrics(data.data.metrics)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!metrics) {
    return <MasterDashboardSkeleton />;
  }

  const todayLabel = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('master.dashboardTitle')}</h1>
        <p className="mt-1 text-sm text-zinc-500">Live beach operations overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricMeta.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm shadow-black/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-400">{t(item.labelKey)}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                    {metrics[item.key] ?? 0}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.accent}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <p className="mt-4 text-xs text-zinc-500">As of {todayLabel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
