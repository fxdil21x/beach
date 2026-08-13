import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import QRScanner from '../../components/qr/QRScanner.jsx';
import ScanResult from '../../components/qr/ScanResult.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { adminNav } from '../../config/navigation.js';
import * as adminApi from '../../api/adminApi.js';

export default function Scanner() {
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [searching, setSearching] = useState(false);

  const handleScan = useCallback(async (rawToken) => {
    setScanning(false);
    setSearching(true);
    setResult(null);
    try {
      const { data } = await adminApi.scanResident(rawToken);
      setResult(data.data);
    } catch (err) {
      setResult({
        valid: false,
        status: 'DENIED',
        reason: err.response?.data?.message || 'Scan failed',
      });
    } finally {
      setSearching(false);
    }
  }, []);

  const handleClose = () => {
    setResult(null);
    setSearching(false);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-24 text-white">
      <MobileHeader title={t('admin.scanTitle')} />
      <main className="px-4 py-6">
        {scanning && !searching && <QRScanner onScan={handleScan} active={scanning} />}
        {searching && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl bg-gray-800 px-6 py-12 text-center">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-6 text-xl font-semibold text-white">{t('admin.searchingResident')}</p>
            <p className="mt-2 text-sm text-gray-300">{t('admin.searchingHint')}</p>
          </div>
        )}
      </main>
      {result && !searching && <ScanResult result={result} onClose={handleClose} />}
      <BottomNavigation items={adminNav} />
    </div>
  );
}
