import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Button from '../../components/ui/Button.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import PhotoPicker from '../../components/resident/PhotoPicker.jsx';
import { ProfileSkeleton } from '../../components/ui/Skeleton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';
import profileBannerImg from '../../assets/banners/profile-banner.jpg';

export default function UserProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(Boolean(user?.residentPassId));
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  useEffect(() => {
    if (!user?.residentPassId) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    passApi.getMyPass()
      .then(({ data }) => setPass(data.data.pass))
      .catch(() => setPass(null))
      .finally(() => setLoading(false));
    return undefined;
  }, [user?.residentPassId]);

  const handleLogout = () => {
    logout();
    navigate('/user/home');
  };

  const handleUploadPhoto = async (file) => {
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError('');
    setPhotoSuccess('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await passApi.updateMyPhoto(formData);
      setPass(data.data.pass);
      setPhotoSuccess(t('resident.photoUpdated'));
    } catch (err) {
      setPhotoError(err.response?.data?.message || t('common.error'));
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <MobileHeader title={t('nav.profile')} showLanguage />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-5 pb-28">
        <BeachBanner
          tabId="profile"
          badge="Verified Account"
          title={user?.name || 'Resident Profile'}
          subtitle="Manage your Muzhappilangad beach resident credentials and pass photo."
          image={profileBannerImg}
        />

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm transition-colors">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-gray-600 dark:text-slate-400">@{user?.username}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{user?.role}</p>
            </div>
            {pass && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm transition-colors">
                <PhotoPicker
                  existingUrl={pass.photoUrl}
                  onSelect={handleUploadPhoto}
                  uploading={photoUploading}
                  error={photoError}
                  success={photoSuccess}
                />
              </div>
            )}
            <Button variant="secondary" onClick={handleLogout} className="w-full py-4">{t('common.logout')}</Button>
          </>
        )}
      </main>
    </div>
  );
}
