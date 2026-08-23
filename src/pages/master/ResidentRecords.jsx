import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  CheckSquare,
  Square,
  MinusSquare,
  RotateCw,
  Search,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function ResidentRecords() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    guardianName: '',
    houseName: '',
    ward: '',
    age: '',
    gender: '',
    newSecIdNo: '',
  });

  // Delete Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // Single delete record
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmationInput, setPurgeConfirmationInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await masterApi.getResidentRecords({ name: query, page: p, limit: 25 });
      setRecords(data.data.records || []);
      setPagination(data.data.pagination || null);
      setPage(p);
      setSelectedIds([]); // Reset selection on page reload
    } catch (err) {
      console.error('Failed to load resident records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  // Selection helpers
  const isAllSelected = useMemo(() => {
    return records.length > 0 && records.every((r) => selectedIds.includes(r._id));
  }, [records, selectedIds]);

  const isIndeterminate = useMemo(() => {
    return records.some((r) => selectedIds.includes(r._id)) && !isAllSelected;
  }, [records, selectedIds, isAllSelected]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const allCurrentIds = records.map((r) => r._id);
      setSelectedIds(allCurrentIds);
    }
  };

  const toggleSelectRecord = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Form Reset
  const resetForm = () => {
    setFormData({
      name: '',
      guardianName: '',
      houseName: '',
      ward: '',
      age: '',
      gender: '',
      newSecIdNo: '',
    });
    setEditingRecord(null);
    setFormError('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      name: record.name || '',
      guardianName: record.guardianName || '',
      houseName: record.houseName || '',
      ward: record.ward || '',
      age: record.age != null ? String(record.age) : '',
      gender: record.gender || '',
      newSecIdNo: record.newSecIdNo || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSaveResident = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      if (editingRecord) {
        await masterApi.updateResidentRecord(editingRecord._id, formData);
      } else {
        await masterApi.createResidentRecord(formData);
      }
      handleCloseModal();
      load(editingRecord ? page : 1);
    } catch (err) {
      setFormError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Single Delete
  const handleConfirmSingleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await masterApi.deleteResidentRecord(deleteTarget._id);
      setDeleteTarget(null);
      const nextPage = records.length === 1 && page > 1 ? page - 1 : page;
      load(nextPage);
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      await masterApi.bulkDeleteResidentRecords(selectedIds);
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      const remainingCount = (pagination?.total || 0) - selectedIds.length;
      const totalPages = Math.max(1, Math.ceil(remainingCount / (pagination?.limit || 25)));
      const targetPage = Math.min(page, totalPages);
      load(targetPage);
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  // Complete Data Purge (Delete all resident records & registered data)
  const handleConfirmPurgeAll = async () => {
    if (purgeConfirmationInput.trim().toUpperCase() !== 'DELETE ALL') {
      return;
    }
    setDeleting(true);
    try {
      const { data } = await masterApi.purgeAllResidentData();
      setPurgeResult(data.data?.summary || {});
      setShowPurgeModal(false);
      setPurgeConfirmationInput('');
      setSelectedIds([]);
      load(1);
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('nav.residentRecords')}
            </h1>
            {pagination && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 border border-zinc-700/50">
                <Users className="h-3 w-3 text-orange-400" />
                {pagination.total}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-zinc-400">
            Imported resident master data and records management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="flex items-center justify-center p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Refresh records"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Purge All Data Button */}
          <button
            onClick={() => {
              setPurgeConfirmationInput('');
              setShowPurgeModal(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2.5 text-xs font-semibold transition-all active:scale-95"
            title="Delete all resident and registered data"
          >
            <Flame className="h-4 w-4 text-red-400" />
            <span>Delete All Data</span>
          </button>

          <Button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            {t('master.addResident')}
          </Button>
        </div>
      </div>

      {/* Purge Success Alert (if just purged) */}
      {purgeResult && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 shadow-md">
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-bold text-emerald-300">
              All resident records and registered data were successfully deleted!
            </p>
            <p className="text-zinc-400 text-xs">
              Deleted {purgeResult.residentRecords || 0} master records,{' '}
              {purgeResult.residentPasses || 0} resident passes,{' '}
              {purgeResult.residentEntryLogs || 0} entry scan logs, and{' '}
              {purgeResult.residentUsers || 0} resident accounts. All Admin & Master Admin logins were preserved.
            </p>
          </div>
          <button
            onClick={() => setPurgeResult(null)}
            className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Input & Top Pagination Controls (Placed after Search Button) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Input and Search Button */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load(1)}
                placeholder="Search resident name, guardian, house, ward..."
                className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3.5 py-2 text-sm text-white placeholder:text-zinc-500 transition-all focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => load(1)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
            >
              {t('common.search')}
            </button>
          </div>

          {/* Top Pagination Buttons (Immediately after Search Button) */}
          {pagination && (
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-zinc-800 lg:pl-3">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => load(page - 1)}
                className="inline-flex h-11 items-center justify-center gap-1 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-semibold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              <span className="px-2 text-xs font-medium text-zinc-400 whitespace-nowrap">
                Page <span className="text-white font-bold">{page}</span> of{' '}
                <span className="text-white font-bold">{pagination.pages || 1}</span>
              </span>

              <button
                type="button"
                disabled={page >= pagination.pages || loading}
                onClick={() => load(page + 1)}
                className="inline-flex h-11 items-center justify-center gap-1 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Action Banner (when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-orange-200 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-zinc-950 font-bold text-xs">
              {selectedIds.length}
            </span>
            <span>
              {selectedIds.length === 1
                ? '1 resident record selected'
                : `${selectedIds.length} resident records selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Records Container */}
      {loading ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-sm">
          <TableSkeleton rows={8} cols={9} dark />
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-12 text-center text-zinc-400 shadow-sm space-y-3">
          <Users className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="text-base font-semibold text-zinc-300">No resident records found</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query or add a new resident record using the button above.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden flex flex-col">
          {/* Mobile Card List (< sm) */}
          <div className="divide-y divide-zinc-800/80 sm:hidden">
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between p-3 bg-zinc-950/60 text-xs text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-orange-400 hover:text-orange-300"
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-5 w-5 fill-orange-500/20" />
                  ) : isIndeterminate ? (
                    <MinusSquare className="h-5 w-5 fill-orange-500/20" />
                  ) : (
                    <Square className="h-5 w-5 text-zinc-500" />
                  )}
                </button>
                <span className="font-semibold text-zinc-300">Select All Page</span>
              </label>
              <span className="text-zinc-500">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {records.map((r) => {
              const isSelected = selectedIds.includes(r._id);
              return (
                <div
                  key={r._id}
                  className={`p-4 space-y-3 transition-colors ${
                    isSelected ? 'bg-orange-500/5' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectRecord(r._id)}
                      className="mt-0.5 text-orange-400 hover:text-orange-300 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 fill-orange-500/20" />
                      ) : (
                        <Square className="h-5 w-5 text-zinc-600" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white truncate">{r.name}</h3>
                      {r.guardianName && (
                        <p className="text-xs text-zinc-400 truncate">
                          Guardian: {r.guardianName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(r)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 transition-colors"
                        title="Edit Resident"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                        title="Delete Resident"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                        House
                      </span>
                      <span className="text-zinc-200 font-medium truncate block">
                        {r.houseName || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                        Ward
                      </span>
                      <span className="text-zinc-200 font-medium truncate block">
                        {r.ward || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                        Age / Gender
                      </span>
                      <span className="text-zinc-200 font-medium">
                        {r.age != null ? r.age : '—'}{' '}
                        {r.gender ? `• ${r.gender}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                        Phone
                      </span>
                      <span className="text-zinc-200 font-mono">{r.phone || '—'}</span>
                    </div>
                  </div>

                  {r.newSecIdNo && (
                    <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold">Sec ID</span>
                      <span className="font-mono text-orange-400/90 text-xs bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                        {r.newSecIdNo}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm border-collapse">
              <thead className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 select-none">
                <tr>
                  <th className="p-3.5 pl-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-orange-400 hover:text-orange-300 flex items-center justify-center"
                      title={isAllSelected ? 'Deselect All' : 'Select All Page'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 fill-orange-500/20" />
                      ) : isIndeterminate ? (
                        <MinusSquare className="h-4.5 w-4.5 fill-orange-500/20" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-zinc-500" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    Name
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    Guardian
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    House
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    Ward
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    Age
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    Phone
                  </th>
                  <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                    Sec ID
                  </th>
                  <th className="p-3.5 pr-4 font-semibold text-xs uppercase tracking-wider text-zinc-400 text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {records.map((r) => {
                  const isSelected = selectedIds.includes(r._id);
                  return (
                    <tr
                      key={r._id}
                      className={`text-zinc-200 transition-colors ${
                        isSelected
                          ? 'bg-orange-500/10 hover:bg-orange-500/15'
                          : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="p-3.5 pl-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRecord(r._id)}
                          className="text-orange-400 hover:text-orange-300 flex items-center justify-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4.5 w-4.5 fill-orange-500/20" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-zinc-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 font-medium text-white whitespace-nowrap">
                        <div>
                          <span>{r.name}</span>
                          {r.gender && (
                            <span className="ml-1.5 text-[11px] text-zinc-500 font-normal">
                              ({r.gender})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-300 whitespace-nowrap">
                        {r.guardianName || '—'}
                      </td>
                      <td className="p-3.5 text-zinc-300 whitespace-nowrap">
                        {r.houseName || '—'}
                      </td>
                      <td className="p-3.5 text-zinc-300 whitespace-nowrap">
                        {r.ward ? (
                          <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700/40">
                            {r.ward}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3.5 text-zinc-300 whitespace-nowrap">
                        {r.age != null ? r.age : '—'}
                      </td>
                      <td className="p-3.5 font-mono text-xs text-zinc-300 whitespace-nowrap">
                        {r.phone || '—'}
                      </td>
                      <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                        {r.newSecIdNo ? (
                          <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            {r.newSecIdNo}
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 transition-colors"
                            title="Edit Resident"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                            title="Delete Resident"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Record Summary */}
          {pagination && (
            <div className="border-t border-zinc-800 bg-zinc-950/60 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-zinc-400 text-center sm:text-left">
                Showing{' '}
                <span className="font-semibold text-white">
                  {(page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-white">
                  {Math.min(page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-semibold text-white">{pagination.total}</span> resident
                records
              </div>

              {/* Bottom Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => load(page - 1)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>

                <span className="px-2 font-medium text-zinc-400">
                  Page <span className="text-white font-bold">{page}</span> of{' '}
                  <span className="text-white font-bold">{pagination.pages || 1}</span>
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.pages || loading}
                  onClick={() => load(page + 1)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Resident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {editingRecord ? 'Edit Resident Record' : t('master.addResidentTitle')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Father / Husband Name"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    House Name
                  </label>
                  <input
                    type="text"
                    value={formData.houseName}
                    onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                    placeholder="House Name / No"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Ward
                  </label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="Ward"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {t('master.secIdOptional')}
                </label>
                <input
                  type="text"
                  value={formData.newSecIdNo}
                  onChange={(e) => setFormData({ ...formData, newSecIdNo: e.target.value })}
                  placeholder="Sec ID (Optional)"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-sm font-medium text-red-500">{formError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Resident Record</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-1 text-xs">
              <p className="font-bold text-white text-sm">{deleteTarget.name}</p>
              {deleteTarget.guardianName && (
                <p className="text-zinc-400">Guardian: {deleteTarget.guardianName}</p>
              )}
              {deleteTarget.houseName && (
                <p className="text-zinc-400">House: {deleteTarget.houseName}</p>
              )}
              {deleteTarget.ward && <p className="text-zinc-400">Ward: {deleteTarget.ward}</p>}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmSingleDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all"
              >
                {deleting ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Resident</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-6 text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Selected Residents</h3>
                <p className="text-xs text-zinc-400">Bulk delete operation</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-red-400">{selectedIds.length}</span> resident record
              {selectedIds.length > 1 ? 's' : ''}? This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmBulkDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/25 disabled:opacity-50 transition-all"
              >
                {deleting ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting {selectedIds.length}...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete ({selectedIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Purge All Resident Data Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border-2 border-red-600/50 bg-zinc-900 p-6 text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5 text-red-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/30 shrink-0">
                <Flame className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete All Resident & Registered Data</h3>
                <p className="text-xs text-red-400/90 font-medium">
                  Permanent full database wipeout for resident records
                </p>
              </div>
            </div>

            {/* Scope Summary Box */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 text-xs">
              <p className="font-semibold text-zinc-300 mb-1">What will be permanently deleted:</p>
              <ul className="space-y-1.5 text-zinc-400 list-disc list-inside">
                <li>
                  <span className="text-red-300 font-medium">All Master Resident Records</span> ({pagination?.total || 'All'} imported voter records)
                </li>
                <li>
                  <span className="text-red-300 font-medium">All Registered Resident Beach Passes</span> (QR passes & registrations)
                </li>
                <li>
                  <span className="text-red-300 font-medium">All Resident Free Entry Logs</span>
                </li>
                <li>
                  <span className="text-red-300 font-medium">All Resident User Accounts</span> (public resident logins)
                </li>
              </ul>

              <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  Admin & Master Admin accounts, general visitor passes, and beach settings are <strong>100% safe and will NOT be deleted</strong>.
                </span>
              </div>
            </div>

            {/* Confirmation input */}
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300 font-medium">
                To confirm, type <span className="font-mono font-bold text-red-400">DELETE ALL</span> below:
              </label>
              <input
                type="text"
                value={purgeConfirmationInput}
                onChange={(e) => setPurgeConfirmationInput(e.target.value)}
                placeholder="Type DELETE ALL"
                className="w-full rounded-xl border border-red-500/40 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none uppercase font-mono tracking-wider"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowPurgeModal(false);
                  setPurgeConfirmationInput('');
                }}
                className="rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || purgeConfirmationInput.trim().toUpperCase() !== 'DELETE ALL'}
                onClick={handleConfirmPurgeAll}
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-red-600/30 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
              >
                {deleting ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Wiping all resident data...</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    <span>Wipe All Resident Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
