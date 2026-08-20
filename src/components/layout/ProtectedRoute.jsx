import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { AppShellSkeleton } from '../ui/Skeleton.jsx';
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

export function ProtectedRoute({ roles, redirectTo }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const adminSide = roles?.includes('ADMIN') || roles?.includes('MASTER_ADMIN');
  const targetRedirect = redirectTo || (adminSide ? '/login' : '/user/home');

  useEffect(() => {
    function handlePopState() {
      const token = localStorage.getItem('beach_app_token');
      if (!token) {
        navigate(targetRedirect, { replace: true });
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, targetRedirect]);

  if (loading) {
    return <AppShellSkeleton />;
  }

  if (!user) return <Navigate to={targetRedirect} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={targetRedirect} replace />;

  return (
    <LanguageScope adminSide={adminSide}>
      <Outlet />
    </LanguageScope>
  );
}

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppShellSkeleton />;
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
