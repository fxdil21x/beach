import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function Admins() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => masterApi.getAdmins().then(({ data }) => setAdmins(data.data.admins)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await masterApi.createUser({ ...form, role: 'ADMIN' });
      setForm({ name: '', username: '', password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
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
          <p className="mt-1 text-sm text-zinc-500">Gate admin accounts and scan activity</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : 'Create Admin'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="grid shrink-0 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm sm:grid-cols-3"
        >
          <Input
            label={t('auth.name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label={t('auth.username')}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="text-sm text-red-400 sm:col-span-3">{error}</p>}
          <div className="sm:col-span-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      )}

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
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40">
                <td className="p-3 font-medium text-white">{a.name}</td>
                <td className="p-3 font-mono text-xs text-orange-400">{a.username}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    a.role === 'MASTER_ADMIN'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  }`}>
                    {a.role}
                  </span>
                </td>
                <td className="p-3">{a.scanCount}</td>
                <td className="p-3 text-zinc-400">
                  {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : '—'}
                </td>
                <td className="p-3">{a.isActive ? 'Active' : 'Disabled'}</td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id, a.username)}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Admin Account"
                  >
                    <Trash2 className="h-4 w-4" />
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
