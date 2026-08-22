import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminNav } from '../../config/navigation.js';

export default function AdminProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('nav.profile')} targetRole="admin" />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xl font-bold">{user?.name}</p>
          <p className="text-gray-600">@{user?.username}</p>
        </div>
        <Button variant="secondary" onClick={() => { logout(); navigate('/login', { replace: true }); }} className="w-full py-4">{t('common.logout')}</Button>
      </main>
      <BottomNavigation items={adminNav} />
    </div>
  );
}
