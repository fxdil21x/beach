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
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader title={t('nav.profile')} />
      <main className="space-y-4 px-4 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xl font-bold">{user?.name}</p>
          <p className="text-gray-600">@{user?.username}</p>
        </div>
        <Button variant="secondary" onClick={() => { logout(); navigate('/login'); }} className="w-full py-4">{t('common.logout')}</Button>
      </main>
      <BottomNavigation items={adminNav} />
    </div>
  );
}
