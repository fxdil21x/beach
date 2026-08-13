import { useTranslation } from 'react-i18next';
import ResidentPhoto from '../resident/ResidentPhoto.jsx';

export default function ScanResult({ result, onClose }) {
  const { t } = useTranslation();
  const granted = result?.valid && result?.status === 'GRANTED';
  const resident = result?.resident;
  const isVisitor = result?.type === 'VISITOR' || Boolean(result?.visitorEntry);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${
        granted ? 'bg-green-600' : 'bg-red-600'
      } text-white`}
    >
      <h2 className="text-center text-3xl font-bold">
        {granted
          ? isVisitor
            ? t('admin.permissionGranted')
            : t('admin.userFound')
          : t('admin.permissionDenied')}
      </h2>

      {granted && !isVisitor && (
        <>
          <p className="mt-2 text-xl">{t('admin.verifiedResident')}</p>
          <p className="text-lg">{t('admin.freeEntry')}</p>
        </>
      )}

      {granted && isVisitor && (
        <>
          <p className="mt-2 text-xl">Verified Visitor Entry</p>
          <p className="text-lg">PAID ENTRY</p>
        </>
      )}

      {!granted && result?.reason && <p className="mt-4 text-center text-lg">{result.reason}</p>}

      {resident && (
        <div className="mt-6 w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-lg">
          {granted && !isVisitor && (
            <p className="mb-4 rounded-xl bg-green-100 px-3 py-2 text-center text-sm font-semibold text-green-800">
              {t('admin.userFound')}
            </p>
          )}
          <ResidentPhoto
            src={resident.photoUrl}
            alt={resident.name}
            className="mx-auto mb-4 h-32 w-32"
          />
          <p className="text-center text-xl font-bold">{resident.name}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-500">{t('resident.fatherName')}</dt>
              <dd className="text-right font-semibold">{resident.guardianName || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
              <dt className="font-medium text-gray-500">{t('resident.houseName')}</dt>
              <dd className="text-right font-semibold">{resident.houseName || '—'}</dd>
            </div>
            {resident.gender && (
              <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                <dt className="font-medium text-gray-500">{t('resident.gender')}</dt>
                <dd className="text-right font-semibold">{resident.gender}</dd>
              </div>
            )}
            {resident.ward && (
              <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                <dt className="font-medium text-gray-500">Ward</dt>
                <dd className="text-right font-semibold">{resident.ward}</dd>
              </div>
            )}
            {resident.age != null && (
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-gray-500">Age</dt>
                <dd className="text-right font-semibold">{resident.age}</dd>
              </div>
            )}
          </dl>
          {result.entryLog?.checkedAt && (
            <p className="mt-4 text-center text-xs text-gray-500">
              {new Date(result.entryLog.checkedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {result?.visitorEntry && (
        <div className="mt-6 w-full max-w-sm rounded-2xl bg-white p-4 text-center text-gray-900">
          <p className="text-sm text-gray-500">Visitors</p>
          <p className="text-4xl font-bold">{result.visitorEntry.visitorCount}</p>
          <p className="mt-4 text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold">Rs {result.visitorEntry.totalAmount}</p>
          {result.visitorEntry.scannedAt && (
            <p className="mt-4 text-sm text-gray-500">
              {new Date(result.visitorEntry.scannedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-8 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
      >
        OK
      </button>
    </div>
  );
}
