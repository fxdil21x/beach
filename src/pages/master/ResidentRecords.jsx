import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Button from '../../components/ui/Button.jsx';
import TableScroll from '../../components/ui/TableScroll.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function ResidentRecords() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await masterApi.getResidentRecords({ name: query, page: p, limit: 25 });
      setRecords(data.data.records);
      setPagination(data.data.pagination);
      setPage(p);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);


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

  const handleDeleteResident = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resident record?')) return;
    try {
      await masterApi.deleteResidentRecord(id);
      load(page);
    } catch (err) {
      alert(err.response?.data?.message || t('common.error'));
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('nav.residentRecords')}</h1>
          <p className="mt-1 text-sm text-zinc-500">Imported resident master data</p>
        </div>
        <Button onClick={handleOpenAddModal} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          {t('master.addResident')}
        </Button>
      </div>

      <div className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
        <SearchInput value={query} onChange={setQuery} onSearch={() => load(1)} />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={8} dark />
      ) : (
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
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40">
                <td className="p-3 font-medium text-white">{r.name}</td>
                <td className="p-3">{r.guardianName || '—'}</td>
                <td className="p-3">{r.houseName || '—'}</td>
                <td className="p-3">{r.ward || '—'}</td>
                <td className="p-3">{r.age != null ? r.age : '—'}</td>
                <td className="p-3 font-mono text-xs">{r.phone || '—'}</td>
                <td className="p-3 font-mono text-xs text-zinc-400">{r.newSecIdNo || '—'}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 transition-colors"
                      title="Edit Resident"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResident(r._id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                      title="Delete Resident"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      )}

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

      {/* Add / Edit Resident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">
                {editingRecord ? 'Edit Resident Record' : t('master.addResidentTitle')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
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
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

