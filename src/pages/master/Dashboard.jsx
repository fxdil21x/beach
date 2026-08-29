import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Footprints,
  BadgeCheck,
  Ticket,
  Users,
} from 'lucide-react';
import MasterSidebar from '../../components/layout/MasterSidebar.jsx';
import MasterHeader from '../../components/layout/MasterHeader.jsx';
import PageContainer from '../../components/layout/PageContainer.jsx';
import { MasterDashboardSkeleton } from '../../components/ui/Skeleton.jsx';
import * as masterApi from '../../api/masterApi.js';

import DashboardHeader from './components/DashboardHeader.jsx';
import MetricSparkCard from './components/MetricSparkCard.jsx';
import TrafficOverviewBarChart from './components/TrafficOverviewBarChart.jsx';
import OperationsDonutChart from './components/OperationsDonutChart.jsx';
import RecentActivityFeed from './components/RecentActivityFeed.jsx';
import TrafficFlowAreaChart from './components/TrafficFlowAreaChart.jsx';
import GoalsProgressCard from './components/GoalsProgressCard.jsx';

export function MasterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
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

export default function MasterDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('This Year');

  const load = useCallback(() => {
    masterApi.getDashboard().then(({ data }) => setMetrics(data.data.metrics)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!metrics) {
    return <MasterDashboardSkeleton />;
  }

  const entriesDiff = (metrics.totalEntriesToday || 0) - (metrics.totalEntriesYesterday || 0);
  const entriesTrend = entriesDiff >= 0 ? `+${entriesDiff}` : `${entriesDiff}`;

  const resDiff = (metrics.residentFreeEntriesToday || 0) - (metrics.residentEntriesYesterday || 0);
  const resTrend = resDiff >= 0 ? `+${resDiff}` : `${resDiff}`;

  const visDiff = (metrics.generalVisitorsToday || 0) - (metrics.generalVisitorsYesterday || 0);
  const visTrend = visDiff >= 0 ? `+${visDiff}` : `${visDiff}`;

  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-8">
      {/* Dynamic Header */}
      <DashboardHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={(period) => setSelectedPeriod(period)}
      />

      {/* Top 4 KPI Metric Cards (Real Database Counts) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Beach Entries Today */}
        <MetricSparkCard
          title="Total Entries Today"
          value={metrics.totalEntriesToday ?? 0}
          trend={entriesTrend}
          trendLabel="vs yesterday"
          isPositive={entriesDiff >= 0}
          icon={Footprints}
          accentColor="orange"
          sparklineData={metrics.sparklines?.totalEntries || [0, 0, 0, 0, 0, 0, 0]}
        />

        {/* Card 2: General Visitors Today */}
        <MetricSparkCard
          title="General Visitors Today"
          value={metrics.generalVisitorsToday ?? 0}
          trend={visTrend}
          trendLabel="vs yesterday"
          isPositive={visDiff >= 0}
          icon={Ticket}
          accentColor="amber"
          sparklineData={metrics.sparklines?.visitorEntries || [0, 0, 0, 0, 0, 0, 0]}
        />

        {/* Card 3: Resident Free Entries Today */}
        <MetricSparkCard
          title="Resident Free Entries Today"
          value={metrics.residentFreeEntriesToday ?? 0}
          trend={resTrend}
          trendLabel="vs yesterday"
          isPositive={resDiff >= 0}
          icon={BadgeCheck}
          accentColor="green"
          sparklineData={metrics.sparklines?.residentEntries || [0, 0, 0, 0, 0, 0, 0]}
        />

        {/* Card 4: Total Registered Residents */}
        <MetricSparkCard
          title="Total Registered Residents"
          value={metrics.totalRegisteredResidents ?? 0}
          trend={`+${metrics.newResidentRegistrations || 0} today`}
          trendLabel="registered"
          isPositive={true}
          icon={Users}
          accentColor="gold"
          sparklineData={metrics.sparklines?.registeredResidents || [0, 0, 0, 0, 0, 0, metrics.totalRegisteredResidents || 0]}
        />
      </div>

      {/* Middle Row: Real Footfall Bar Chart (7 cols) + Operations Breakdown (5 cols) */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TrafficOverviewBarChart
            title="Beach Entries & Footfall Overview"
            total={metrics.annualTotal ?? metrics.totalEntriesToday ?? 0}
            formattedTotal={String((metrics.annualTotal ?? metrics.totalEntriesToday ?? 0).toLocaleString())}
            growth={`+${metrics.totalEntriesToday ?? 0}`}
            growthLabel="recorded today"
            monthlyData={metrics.monthlyOverview}
          />
        </div>

        <div className="lg:col-span-5">
          <OperationsDonutChart
            title="Operations & Entry Breakdown"
            totalLabel="Total Records"
            totalOps={metrics.totalOps ?? 0}
            formattedTotal={String((metrics.totalOps ?? 0).toLocaleString())}
            breakdown={metrics.breakdown}
          />
        </div>
      </div>

      {/* Bottom Row: Recent Live Activity (1 col) + Daily Flow (1 col) + Operational Health Goals (1 col) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Left: Recent Activity Feed */}
        <RecentActivityFeed
          title="Recent Beach Activity"
          activities={metrics.liveActivity}
          viewAllLink="/master/resident-entries"
        />

        {/* Middle: Daily Footfall Flow */}
        <TrafficFlowAreaChart
          title="Daily Footfall Flow"
          total={metrics.totalEntriesToday ?? 0}
          formattedTotal={String((metrics.totalEntriesToday ?? 0).toLocaleString())}
          growth={`+${metrics.totalEntriesToday ?? 0}`}
          growthLabel="today"
          flowData={metrics.flowTrend}
        />

        {/* Right: Operational Health Goals */}
        <GoalsProgressCard
          title="Operational Goals & Health"
          goals={metrics.goals}
          viewAllLink="/master/analytics"
        />
      </div>
    </div>
  );
}
