import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/master/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-md flex-1">
        <h1 className="text-3xl font-bold text-gray-900">{t('auth.registerTitle')}</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input label={t('auth.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label={t('auth.username')} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label={t('auth.password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full py-4 text-lg">{loading ? t('common.loading') : t('auth.registerButton')}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.hasAccount')} <Link to="/login" className="font-medium text-blue-600">{t('auth.loginButton')}</Link>
        </p>
      </div>
    </div>
  );
}
