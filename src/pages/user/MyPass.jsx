import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import ResidentQR from '../../components/qr/ResidentQR.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { userNav } from '../../config/navigation.js';
import * as passApi from '../../api/residentPassApi.js';

export default function MyPass() {
  const { t } = useTranslation();
  const [pass, setPass] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner size="lg" className="mx-auto mt-20" />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader title={t('pass.title')} showLanguage />
      <main className="flex flex-col items-center px-4 py-6">
        {!pass ? (
          <div className="text-center">
            <p className="text-gray-600">{t('pass.noPass')}</p>
            <Link to="/user/search"><Button className="mt-4">{t('pass.getPass')}</Button></Link>
          </div>
        ) : (
          <>
            {!pass.isActive && <p className="mb-4 text-red-600">{t('pass.inactive')}</p>}
            <p className="mb-4 text-center text-gray-600">{t('pass.showQr')}</p>
            {qrToken && <ResidentQR token={qrToken} size={300} />}
            <div className="mt-6 w-full max-w-sm rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-xl font-bold">{pass.resident?.name}</p>
              <p className="text-gray-600">{pass.resident?.houseName}</p>
            </div>
          </>
        )}
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
