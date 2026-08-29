import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay.jsx';
import { VisitsSkeleton } from '../../components/ui/Skeleton.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';
import visitsBannerImg from '../../assets/banners/visits-banner.jpg';

export default function MyVisits() {
  const { t } = useTranslation();
  const [data, setData] = useState({ entries: [], total: 0, lastVisit: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    passApi.getMyEntries()
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <TabMaintenanceOverlay tabId="my-visits" fallbackTitle="Visits Log Under Maintenance" />
      <MobileHeader title={t('visits.title')} showLanguage />
      <main className="relative flex-1 min-h-0 overflow-y-auto space-y-4 px-4 pt-4 pb-32">

        <BeachBanner
          badge="Access History"
          title="My Beach Visits"
          subtitle="Real-time log of your verified gate entries and drive-in beach visits."
          image={visitsBannerImg}
        />

        {loading ? (
          <VisitsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">{t('visits.lastVisit')}</p>
                <p className="text-lg font-bold">{data.lastVisit ? new Date(data.lastVisit).toLocaleString() : '—'}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">{t('visits.totalScans')}</p>
                <p className="text-lg font-bold">{data.total}</p>
              </div>
            </div>
            {data.entries.length === 0 ? (
              <EmptyState title={t('visits.noVisits')} />
            ) : (
              data.entries.map((entry) => (
                <div key={entry._id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="font-medium">{new Date(entry.checkedAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </>
        )}
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
