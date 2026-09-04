import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, AlertCircle, ArrowLeft, Lock, UserCheck } from 'lucide-react';
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
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(form.username, form.password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/search', { replace: true });
      } else if (loggedUser.role === 'MASTER_ADMIN') {
        navigate('/master/dashboard', { replace: true });
      } else {
        navigate('/user/home', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-md">
        {/* Top Back navigation */}
        <div className="mb-4">
          <Link
            to="/user/home"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t('common.back', 'Back')} to Home</span>
          </Link>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200/20 text-slate-900 dark:text-white space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Staff & Admin Login</h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Muzhappilangad Beach Gate Officers & Admins
            </p>
          </div>

          {user && user.role === 'USER' && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <UserCheck className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Currently in Resident Mode</p>
                <p>Log in with staff credentials below to switch to the Admin Portal.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.username', 'Username')}
              placeholder="Enter staff / admin username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={error ? 'Invalid credentials' : undefined}
              required
              autoFocus
              autoCapitalize="none"
              className="bg-slate-50 dark:bg-slate-800"
            />
            <Input
              label={t('auth.password', 'Password')}
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={error ? 'Invalid credentials' : undefined}
              required
              className="bg-slate-50 dark:bg-slate-800"
            />

            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <AlertTitle className="text-red-900 font-bold">Authentication Failed</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </div>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3.5 text-base font-bold shadow-md">
              {loading ? (
                t('common.loading')
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>{t('auth.loginButton', 'Sign In to Portal')}</span>
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you a beach resident?{' '}
              <Link to="/user/home" className="font-semibold text-blue-600 hover:underline">
                Go to Resident Pass Page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
