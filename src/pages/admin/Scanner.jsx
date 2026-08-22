import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import QRScanner from '../../components/qr/QRScanner.jsx';
import ScanResult from '../../components/qr/ScanResult.jsx';
import { ScannerSkeleton } from '../../components/ui/Skeleton.jsx';
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
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-900 text-white">
      <MobileHeader title={t('admin.scanTitle')} targetRole="admin" />
      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        {scanning && !searching && <QRScanner onScan={handleScan} active={scanning} />}
        {searching && <ScannerSkeleton />}
      </main>
      {result && !searching && <ScanResult result={result} onClose={handleClose} />}
      <BottomNavigation items={adminNav} />
    </div>
  );
}

