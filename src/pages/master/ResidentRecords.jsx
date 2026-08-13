import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Button from '../../components/ui/Button.jsx';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function ResidentRecords() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = async (p = 1) => {
    const { data } = await masterApi.getResidentRecords({ name: query, page: p, limit: 25 });
    setRecords(data.data.records);
    setPagination(data.data.pagination);
    setPage(p);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white">{t('nav.residentRecords')}</h1>
        <p className="mt-1 text-sm text-zinc-500">Imported resident master data</p>
      </div>

      <div className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
        <SearchInput value={query} onChange={setQuery} onSearch={() => load(1)} />
      </div>

      <TableScroll className="shadow-sm shadow-black/20">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Guardian</th>
              <th className="p-3 font-medium">House</th>
              <th className="p-3 font-medium">Ward</th>
              <th className="p-3 font-medium">Age</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Sec ID</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40">
                <td className="p-3 font-medium text-white">{r.name}</td>
                <td className="p-3">{r.guardianName}</td>
                <td className="p-3">{r.houseName}</td>
                <td className="p-3">{r.ward}</td>
                <td className="p-3">{r.age}</td>
                <td className="p-3 font-mono text-xs">{r.phone || '—'}</td>
                <td className="p-3 font-mono text-xs text-zinc-400">{r.newSecIdNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>

      {pagination && (
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => load(page - 1)}>
            Prev
          </Button>
          <span className="px-2 text-sm text-zinc-400">
            Page {page} / {pagination.pages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= pagination.pages}
            onClick={() => load(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
