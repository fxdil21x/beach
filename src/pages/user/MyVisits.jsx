import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';

export default function MyVisits() {
  const { t } = useTranslation();
  const [data, setData] = useState({ entries: [], total: 0, lastVisit: null });

  useEffect(() => {
    passApi.getMyEntries().then(({ data: res }) => setData(res.data)).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('visits.title')} showLanguage />
      <main className="flex-1 overflow-y-auto space-y-4 px-4 py-6">
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
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
