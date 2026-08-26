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
    <div className="rounded-2xl bg-white p-5 shadow-sm ">
      {!pass.isActive && (
        <p className="text-center text-sm font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
          {t('pass.inactive')}
        </p>
      )}

      {/* Resident Info (Top of QR) */}
      <div className="rounded-xl bg-gray-50 p-4 text-center">
        {pass.photoUrl && (
          <div className="mx-auto mb-2.5 h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md">
            <img
              src={pass.photoUrl}
              alt={pass.resident?.name || 'Resident'}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <p className="text-xl font-bold text-gray-900">{pass.resident?.name}</p>
        <p className="text-sm font-medium text-gray-500">{pass.resident?.houseName}</p>
      </div>

      {/* QR Code Section */}
      <div className="text-center pt-1">
        <p className="text-xs sm:text-sm text-gray-500  mb-1">{t('pass.showQr')}</p>
        {qrToken && (
          <div className="flex justify-center">
            <ResidentQR token={qrToken} size={280} />
          </div>
        )}
      </div>

      {credentials && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">{t('resident.saveCredentials')}</p>
          <p className="mt-2">{t('resident.phoneAsPassword')}</p>
          <p className="mt-1 font-mono">{credentials.phone}</p>
        </div>
      )}
    </div>
  );
}
