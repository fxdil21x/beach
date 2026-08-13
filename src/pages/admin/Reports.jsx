import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { adminNav } from '../../config/navigation.js';
import * as adminApi from '../../api/adminApi.js';

export default function AdminReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);

  const load = () => adminApi.getReports().then(({ data }) => setReports(data.data.reports)).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await adminApi.updateReportStatus(id, status);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader title={t('admin.reportsTitle')} />
      <main className="space-y-3 px-4 py-6">
        {reports.map((r) => (
          <div key={r._id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold">{t(`report.categories.${r.category}`)}</p>
              <StatusBadge status={r.status} label={t(`report.status.${r.status}`)} />
            </div>
            <p className="mt-2 text-sm text-gray-600">{r.description}</p>
            <div className="mt-3 flex gap-2">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
                <button key={s} type="button" onClick={() => updateStatus(r._id, s)} className="rounded-lg bg-gray-100 px-3 py-1 text-xs">{t(`report.status.${s}`)}</button>
              ))}
            </div>
          </div>
        ))}
      </main>
      <BottomNavigation items={adminNav} />
    </div>
  );
}
