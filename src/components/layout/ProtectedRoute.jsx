import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
import i18n from '../../i18n/i18n.js';

const LANGUAGE_STORAGE_KEY = 'beach_app_language';

function LanguageScope({ adminSide, children }) {
  useEffect(() => {
    if (!adminSide) return undefined;

    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    i18n.changeLanguage('en');

    return () => {
      i18n.changeLanguage(saved);
    };
  }, [adminSide]);

  return children;
}

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const adminSide = roles?.includes('ADMIN') || roles?.includes('MASTER_ADMIN');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <LanguageScope adminSide={adminSide}>
      <Outlet />
    </LanguageScope>
  );
}

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/recent" replace />;
    if (user.role === 'MASTER_ADMIN') return <Navigate to="/master/dashboard" replace />;
    return <Navigate to="/user/home" replace />;
  }

  return <Outlet />;
}

export function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/user/home" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/recent" replace />;
  if (user.role === 'MASTER_ADMIN') return <Navigate to="/master/dashboard" replace />;
  return <Navigate to="/user/home" replace />;
}
