import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import TableScroll from '../../components/ui/TableScroll.jsx';
import * as masterApi from '../../api/masterApi.js';

export default function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'USER' });
  const [showForm, setShowForm] = useState(false);

  const load = () => masterApi.getUsers().then(({ data }) => setUsers(data.data.users)).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await masterApi.createUser(form);
    setShowForm(false);
    setForm({ name: '', username: '', password: '', role: 'USER' });
    load();
  };

  const toggleUser = async (id, isActive) => {
    await masterApi.updateUser(id, { isActive });
    load();
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('nav.users')}</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage system user accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : 'Create User'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="grid shrink-0 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:grid-cols-2"
        >
          <Input label={t('auth.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label={t('auth.username')} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label={t('auth.password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MASTER_ADMIN">MASTER_ADMIN</option>
          </select>
          <Button type="submit">Create</Button>
        </form>
      )}

      <TableScroll>
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-zinc-400">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Username</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/40">
                <td className="p-3 font-medium text-white">{u.name}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.isActive ? 'Active' : 'Disabled'}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleUser(u.id, !u.isActive)}
                    className="text-sm font-medium text-orange-300 hover:text-orange-200"
                  >
                    {u.isActive ? 'Disable' : 'Enable'}
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
