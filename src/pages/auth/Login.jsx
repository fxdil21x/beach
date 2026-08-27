import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert.jsx';

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/search', { replace: true });
    } else if (user?.role === 'MASTER_ADMIN') {
      navigate('/master/dashboard', { replace: true });
    } else if (user) {
      navigate('/user/home', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      if (user.role === 'ADMIN') navigate('/admin/search');
      else if (user.role === 'MASTER_ADMIN') navigate('/master/dashboard');
      else navigate('/user/home');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50/80 via-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{t('auth.loginTitle')}</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {t('auth.residentLoginHint')}{' '}
            <Link to="/user/home" className="font-semibold text-blue-600 hover:underline">
              {t('nav.home')}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.username')}
            placeholder="Enter username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={error ? 'Invalid credentials' : undefined}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={error ? 'Invalid credentials' : undefined}
            required
          />

          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <AlertTitle className="text-red-900 font-bold">Invalid Credentials</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </div>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full py-3.5 text-base font-bold shadow-md">
            {loading ? t('common.loading') : t('auth.loginButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
