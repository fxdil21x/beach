import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import PhotoPicker from './PhotoPicker.jsx';

export default function ResidentPassForm({ resident, onSubmit, loading, error }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ phone, photo });
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{t('resident.completeRegistration')}</h3>
      <div className="mt-3 rounded-xl bg-blue-50 p-4 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{resident.name}</p>
        <p>{t('resident.fatherName')}: {resident.guardianName || '—'}</p>
        <p>{t('resident.houseName')}: {resident.houseName || '—'}</p>
        <p>{t('resident.gender')}: {resident.gender || '—'}</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label={t('resident.phone')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">{t('resident.phoneAsPassword')}</p>
        <Input
          label={t('resident.gender')}
          value={resident.gender || ''}
          placeholder={t('resident.genderPlaceholder')}
          readOnly
          className="cursor-default bg-gray-50 text-gray-700"
        />
        <PhotoPicker onSelect={setPhoto} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full py-3.5 text-base sm:py-4 sm:text-lg">
          {loading ? t('common.loading') : t('resident.createPass')}
        </Button>
      </form>
    </div>
  );
}
