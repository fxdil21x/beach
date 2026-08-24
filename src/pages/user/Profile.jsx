import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Button from '../../components/ui/Button.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import PhotoPicker from '../../components/resident/PhotoPicker.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';
import profileBannerImg from '../../assets/banners/profile-banner.jpg';

export default function UserProfile() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  useEffect(() => {
    if (!user?.residentPassId) return undefined;
    passApi.getMyPass()
      .then(({ data }) => setPass(data.data.pass))
      .catch(() => setPass(null));
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
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('nav.profile')} showLanguage />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-5">
        <BeachBanner
          badge="Verified Account"
          title={user?.name || 'Resident Profile'}
          subtitle="Manage your Muzhappilangad beach resident credentials and pass photo."
          image={profileBannerImg}
        />

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xl font-bold">{user?.name}</p>
          <p className="text-gray-600">@{user?.username}</p>
          <p className="mt-2 text-sm text-gray-500">{user?.role}</p>
        </div>
        {pass && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
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
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
