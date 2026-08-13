import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function ResidentEntries() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);

  const load = useCallback(() => {
    masterApi.getEntryLogs().then(({ data }) => setLogs(data.data.logs)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const intervalId = window.setInterval(load, 5000);
    return () => window.clearInterval(intervalId);
  }, [load]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white">{t('nav.residentEntries')}</h1>
        <p className="mt-1 text-sm text-zinc-500">Resident QR scan logs</p>
      </div>

      <TableScroll>
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400">
            <tr>
              <th className="p-3 font-medium">Resident</th>
              <th className="p-3 font-medium">Ward</th>
              <th className="p-3 font-medium">Admin</th>
              <th className="p-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40">
                <td className="p-3 font-medium text-white">{l.residentRecordId?.name}</td>
                <td className="p-3">{l.residentRecordId?.ward}</td>
                <td className="p-3">{l.checkedBy?.name}</td>
                <td className="p-3 text-zinc-400">{new Date(l.checkedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}
