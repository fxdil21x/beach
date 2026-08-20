import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export default function ResidentPhoneLoginForm({ resident, onSubmit, loading, error }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ phone });
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{t('resident.enterPassword')}</h3>
      <div className="mt-3 rounded-xl bg-blue-50 p-4 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{resident.name}</p>
        <p>{t('resident.fatherName')}: {resident.guardianName || '—'}</p>
        <p>{t('resident.houseName')}: {resident.houseName || '—'}</p>
        <p>{t('resident.gender')}: {resident.gender || '—'}</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label={t('resident.passwordLabel')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('resident.passwordPlaceholder')}
          required
        />
        <p className="text-xs text-gray-500">{t('resident.phoneAsPassword')}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full py-3.5 text-base sm:py-4 sm:text-lg">
          {loading ? t('common.loading') : t('resident.showQrPass')}
        </Button>
      </form>
    </div>
  );
}
