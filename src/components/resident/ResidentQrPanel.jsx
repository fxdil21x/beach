import { useTranslation } from 'react-i18next';
import ResidentQR from '../qr/ResidentQR.jsx';

export default function ResidentQrPanel({
  pass,
  qrToken,
  credentials = null,
}) {
  const { t } = useTranslation();

  if (!pass) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-colors">
      {!pass.isActive && (
        <p className="text-center text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50">
          {t('pass.inactive')}
        </p>
      )}

      {/* Resident Info (Top of QR) */}
      <div className="rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 p-4 text-center">
        {pass.photoUrl && (
          <div className="mx-auto mb-2.5 h-16 w-16 overflow-hidden rounded-full border-2 border-white dark:border-slate-700 shadow-md">
            <img
              src={pass.photoUrl}
              alt={pass.resident?.name || 'Resident'}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <p className="text-xl font-bold text-gray-900 dark:text-white">{pass.resident?.name}</p>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{pass.resident?.houseName}</p>
      </div>

      {/* QR Code Section */}
      <div className="text-center pt-1">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-2">{t('pass.showQr')}</p>
        {qrToken && (
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
              <ResidentQR token={qrToken} size={260} />
            </div>
          </div>
        )}
      </div>

      {credentials && (
        <div className="mt-4 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40 p-4 text-sm text-blue-900 dark:text-blue-200">
          <p className="font-medium">{t('resident.saveCredentials')}</p>
          <p className="mt-2">{t('resident.phoneAsPassword')}</p>
          <p className="mt-1 font-mono">{credentials.phone}</p>
        </div>
      )}
    </div>
  );
}
