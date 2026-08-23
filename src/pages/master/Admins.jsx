import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Pencil, Plus, X, Shield, ShieldCheck, UserCheck, KeyRound, Check, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function Admins() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    role: 'ADMIN',
    password: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    return masterApi
      .getAdmins()
      .then(({ data }) => setAdmins(data.data.admins || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setForm({
      name: '',
      username: '',
      role: 'ADMIN',
      password: '',
      isActive: true,
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin);
    setForm({
      name: admin.name || '',
      username: admin.username || '',
      role: admin.role || 'ADMIN',
      password: '',
      isActive: admin.isActive ?? true,
    });
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingAdmin) {
        const payload = {
          name: form.name.trim(),
          username: form.username.trim(),
          role: 'ADMIN',
          isActive: form.isActive,
        };
        if (form.password && form.password.trim()) {
          payload.password = form.password.trim();
        }
        await masterApi.updateUser(editingAdmin.id, payload);
      } else {
        await masterApi.createUser({
          name: form.name.trim(),
          username: form.username.trim(),
          password: form.password,
          role: 'ADMIN',
        });
      }

      handleCloseModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || (editingAdmin ? 'Failed to update admin' : 'Failed to create admin'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete admin account "@${username}"?`)) return;
    try {
      await masterApi.deleteUser(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('nav.admins')}</h1>
          <p className="mt-1 text-sm text-zinc-500">Gate admin accounts, roles, and scan activity</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Admin</span>
        </Button>
      </div>

      {/* Admins Table */}
      <TableScroll>
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Username</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Scans</th>
              <th className="p-3 font-medium">Last Login</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  No admin accounts found.
                </td>
              </tr>
            )}
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40 transition-colors">
                <td className="p-3 font-medium text-white">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-xs ${
                      a.role === 'MASTER_ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'
                    }`}>
                      {a.name ? a.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span>{a.name}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs text-orange-400">@{a.username}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                      a.role === 'MASTER_ADMIN'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {a.role === 'MASTER_ADMIN' ? (
                      <Shield className="h-3 w-3 text-purple-400" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 text-blue-400" />
                    )}
                    {a.role === 'MASTER_ADMIN' ? 'MASTER_ADMIN' : 'ADMIN (Gate)'}
                  </span>
                </td>
                <td className="p-3 font-medium">{a.scanCount}</td>
                <td className="p-3 text-zinc-400">
                  {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : '—'}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${a.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {a.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(a)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="Edit Admin"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id, a.username)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Admin Account"
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

      {/* Create / Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/25">
                  {editingAdmin ? <Pencil className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingAdmin ? 'Edit Admin Account' : 'Create Admin Account'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {editingAdmin ? `Modify details for @${editingAdmin.username}` : 'Add a new administrative user to the system'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                    placeholder="gateadmin1"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-8 pr-3.5 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Role Display */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Role
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-white">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-blue-300">Gate Admin (Security Officer)</span>
                      <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-mono text-blue-300">ADMIN</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      QR pass verification, visitor entries, and gate security control.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {editingAdmin ? 'New Password (Optional)' : 'Password'} {!editingAdmin && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingAdmin ? 'Leave blank to keep current password' : 'Enter password'}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                {editingAdmin && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Only fill this if you want to reset the admin's password.
                  </p>
                )}
              </div>

              {/* Status (Active / Disabled) - visible when editing */}
              {editingAdmin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Account Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: true })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                        form.isActive
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: false })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                        !form.isActive
                          ? 'border-red-500/50 bg-red-500/15 text-red-300'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      Disabled
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingAdmin ? 'Save Changes' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
