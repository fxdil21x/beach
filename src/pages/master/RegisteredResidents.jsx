import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchInput from '../../components/ui/SearchInput.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return phone || '—';
  return `XXXXXX${digits.slice(-4)}`;
}

export default function RegisteredResidents() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [residents, setResidents] = useState([]);

  const load = () =>
    masterApi
      .getRegisteredResidents({ name: query })
      .then(({ data }) => setResidents(data.data.residents))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 sm:gap-6 pb-6">
      <div className="shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t('nav.registeredResidents')}</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-zinc-500">Residents with active beach passes</p>
      </div>

      <div className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 sm:p-4">
        <SearchInput value={query} onChange={setQuery} onSearch={load} />
      </div>

      <TableScroll>
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400">
            <tr>
              <th className="p-3.5 font-semibold whitespace-nowrap">Name</th>
              <th className="p-3.5 font-semibold whitespace-nowrap">Phone</th>
              <th className="p-3.5 font-semibold whitespace-nowrap">Ward</th>
              <th className="p-3.5 font-semibold whitespace-nowrap">Entries</th>
              <th className="p-3.5 font-semibold whitespace-nowrap">Status</th>
              <th className="p-3.5 font-semibold whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((r) => (
              <tr key={r._id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40 transition-colors">
                <td className="p-3.5 font-medium text-white whitespace-nowrap">{r.residentRecordId?.name}</td>
                <td className="p-3.5 font-mono text-xs whitespace-nowrap">{maskPhone(r.phone)}</td>
                <td className="p-3.5 whitespace-nowrap">{r.residentRecordId?.ward}</td>
                <td className="p-3.5 whitespace-nowrap">{r.entryCount}</td>
                <td className="p-3.5 whitespace-nowrap">
                  <StatusBadge status={r.isActive ? 'active' : 'disabled'} />
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => masterApi.togglePassStatus(r._id, !r.isActive).then(load)}
                    className="text-sm font-medium text-orange-300 hover:text-orange-200"
                  >
                    {r.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}
