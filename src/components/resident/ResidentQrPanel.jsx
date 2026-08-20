import { useTranslation } from 'react-i18next';
import ResidentQR from '../qr/ResidentQR.jsx';
import PhotoPicker from './PhotoPicker.jsx';

export default function ResidentQrPanel({
  pass,
  qrToken,
  credentials = null,
  onUploadPhoto,
  photoUploading = false,
  photoError = '',
  photoSuccess = '',
}) {
  const { t } = useTranslation();

  if (!pass) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      {!pass.isActive && <p className="mb-4 text-red-600">{t('pass.inactive')}</p>}
      <p className="text-center text-gray-600">{t('pass.showQr')}</p>
      {qrToken && (
        <div className="mt-4 flex justify-center">
          <ResidentQR token={qrToken} size={280} />
        </div>
      )}
      <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center">
        <p className="text-xl font-bold text-gray-900">{pass.resident?.name}</p>
        <p className="text-gray-600">{pass.resident?.houseName}</p>
      </div>
      {onUploadPhoto && (
        <div className="mt-4">
          <PhotoPicker
            existingUrl={pass.photoUrl}
            onSelect={onUploadPhoto}
            uploading={photoUploading}
            error={photoError}
            success={photoSuccess}
            label={false}
          />
        </div>
      )}
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
