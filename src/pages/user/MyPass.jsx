import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import ResidentQrPanel from '../../components/resident/ResidentQrPanel.jsx';
import Button from '../../components/ui/Button.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay.jsx';
import { MyPassSkeleton } from '../../components/ui/Skeleton.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';
import passBannerImg from '../../assets/banners/pass-banner.jpg';

export default function MyPass() {
  const { t } = useTranslation();
  const [pass, setPass] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  useEffect(() => {
    passApi.getMyPass()
      .then(async (passRes) => {
        const passData = passRes.data.data.pass;
        setPass(passData);
        if (passData) {
          const qrRes = await passApi.getMyQr();
          setQrToken(qrRes.data.data.qrToken);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <TabMaintenanceOverlay tabId="my-pass" fallbackTitle="Pass System Under Maintenance" />
      <MobileHeader title={t('pass.title')} showLanguage />
      <main className="relative flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-32 space-y-4">

        <BeachBanner
          tabId="pass"
          badge="Digital Gate Clearance"
          title="Beach Resident Pass"
          subtitle="Scan your verified QR code at the entrance gates for seamless vehicle drive-in access."
          image={passBannerImg}
        />

        {loading ? (
          <MyPassSkeleton />
        ) : !pass ? (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
            <p className="text-gray-600 dark:text-slate-400">{t('pass.noPass')}</p>
            <Link to="/user/search"><Button className="mt-4">{t('pass.getPass')}</Button></Link>
          </div>
        ) : (
          <ResidentQrPanel
            pass={pass}
            qrToken={qrToken}
          />
        )}
      </main>
    </div>
  );
}

