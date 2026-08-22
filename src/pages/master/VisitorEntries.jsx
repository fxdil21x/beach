import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function VisitorEntries() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);

  const load = useCallback(() => {
    masterApi.getVisitorEntries().then(({ data }) => setEntries(data.data.entries)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white">{t('nav.visitorEntries')}</h1>
        <p className="mt-1 text-sm text-zinc-500">Guest beach entry logs</p>
      </div>

      <TableScroll>
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400">
            <tr>
              <th className="p-3 font-medium">Count</th>
              <th className="p-3 font-medium">Fee/Person</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e._id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40">
                <td className="p-3 text-white">{e.visitorCount}</td>
                <td className="p-3">₹{e.entryFeePerPerson}</td>
                <td className="p-3 font-semibold text-orange-300">₹{e.visitorCount * e.entryFeePerPerson}</td>
                <td className="p-3 text-zinc-400">{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}
