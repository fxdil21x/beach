import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import PhotoPicker from '../../components/resident/PhotoPicker.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';

export default function ResidentRegistration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const resident = state?.resident;
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!resident) {
    navigate('/user/search');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('residentRecordId', resident.id);
      formData.append('phone', phone);
      if (photo) formData.append('photo', photo);
      await passApi.createPass(formData);
      navigate('/user/my-pass');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('resident.registrationTitle')} showLanguage />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold">{resident.name}</h2>
          <p className="text-gray-600">{resident.houseName} · {resident.ward}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('resident.phone')} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <PhotoPicker onSelect={setPhoto} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
            {loading ? t('common.loading') : t('resident.createPass')}
          </Button>
        </form>
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
