import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { AppShellSkeleton } from '../ui/Skeleton.jsx';

export function ProtectedRoute({ roles, redirectTo }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const adminSide = roles?.includes('ADMIN') || roles?.includes('MASTER_ADMIN');
  const targetRedirect = redirectTo || (
    user?.role === 'ADMIN'
      ? '/admin/search'
      : user?.role === 'MASTER_ADMIN'
      ? '/master/dashboard'
      : adminSide
      ? '/login'
      : '/user/home'
  );

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

  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  const hasToken = typeof window !== 'undefined' && Boolean(
    localStorage.getItem('beach_app_token') || localStorage.getItem('beach_app_refresh_token')
  );

  if (loading && hasToken) {
    return <AppShellSkeleton />;
  }

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/search" replace />;
    if (user.role === 'MASTER_ADMIN') return <Navigate to="/master/dashboard" replace />;
  }

  return <Outlet />;
}

export function RoleRedirect() {
  const { user, loading } = useAuth();
  const hasToken = typeof window !== 'undefined' && Boolean(
    localStorage.getItem('beach_app_token') || localStorage.getItem('beach_app_refresh_token')
  );

  // If no token exists, immediately redirect to /user/home without waiting
  if (!hasToken) {
    return <Navigate to="/user/home" replace />;
  }

  // If loading with an active token, show skeleton instead of returning null
  if (loading) {
    return <AppShellSkeleton />;
  }

  if (!user) return <Navigate to="/user/home" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/search" replace />;
  if (user.role === 'MASTER_ADMIN') return <Navigate to="/master/dashboard" replace />;
  return <Navigate to="/user/home" replace />;
}
