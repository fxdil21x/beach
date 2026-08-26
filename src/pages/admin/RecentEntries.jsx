import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import { RecentEntriesSkeleton } from '../../components/ui/Skeleton.jsx';
import { adminNav } from '../../config/navigation.js';
import * as adminApi from '../../api/adminApi.js';

export default function RecentEntries() {
  const { t } = useTranslation();
  const [visitorEntries, setVisitorEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .getVisitorEntries()
      .then(({ data }) => setVisitorEntries(data.data.entries || []))
      .catch(() => setVisitorEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const handleUpdate = () => {
      load();
    };
    window.addEventListener('visitor-entry-updated', handleUpdate);
    return () => window.removeEventListener('visitor-entry-updated', handleUpdate);
  }, [load]);

  const counts = useMemo(() => {
    let approved = 0;
    let rejected = 0;
    for (const entry of visitorEntries) {
      if (entry.status === 'APPROVED') approved += 1;
      if (entry.status === 'REJECTED') rejected += 1;
    }
    return { approved, rejected };
  }, [visitorEntries]);

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('admin.recentTitle')} targetRole="admin" />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white sm:p-6">
          <h2 className="text-xl font-bold leading-snug sm:text-2xl">{t('admin.recentTitle')}</h2>
          <p className="mt-2 text-sm opacity-90 sm:text-base">{t('admin.visitorSummary')}</p>
        </div>

        {loading ? (
          <RecentEntriesSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="text-sm font-semibold text-gray-700">{t('admin.approvedCount')}</p>
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900">{counts.approved}</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <XCircle className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="text-sm font-semibold text-gray-700">{t('admin.rejectedCount')}</p>
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900">{counts.rejected}</p>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation items={adminNav} />
    </div>
  );
}
