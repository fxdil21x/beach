import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';

export default function QRScanner({ onScan, active = true }) {
  const { t } = useTranslation();
  const scannerRef = useRef(null);
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    const readerElement = document.getElementById(readerIdRef.current);
    if (readerElement) readerElement.innerHTML = '';

    const scanner = new Html5Qrcode(readerIdRef.current);
    scannerRef.current = scanner;

    const stopVideoTracks = () => {
      const element = document.getElementById(readerIdRef.current);
      element?.querySelectorAll('video').forEach((video) => {
        const stream = video.srcObject;
        if (stream instanceof MediaStream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        video.srcObject = null;
      });
    };

    const stopScanner = async () => {
      stopVideoTracks();
      if (scanner.isScanning) {
        await scanner.stop().catch(() => {});
      }
      stopVideoTracks();
      await scanner.clear().catch(() => {});
      const element = document.getElementById(readerIdRef.current);
      if (element) element.innerHTML = '';
      if (scannerRef.current === scanner) scannerRef.current = null;
    };

    const startPromise = scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!cancelled) onScan(decodedText);
        },
        () => {}
      )
      .then(() => {
        if (cancelled && scanner.isScanning) {
          return stopScanner();
        }
        return undefined;
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      startPromise.finally(() => {
        stopScanner();
      });
    };
  }, [active, onScan]);

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm text-gray-600">{t('admin.scanHint')}</p>
      <div id={readerIdRef.current} className="overflow-hidden rounded-2xl" />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
