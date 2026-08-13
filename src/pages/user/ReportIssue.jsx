import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { userNav } from '../../config/navigation.js';
import { createReport } from '../../api/reportApi.js';

const CATEGORIES = ['Garbage', 'Overflowing Bin', 'Unsafe Driving', 'Damaged Facility', 'Noise Problem', 'Safety Issue', 'Other'];

export default function UserReportIssue() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ category: 'Garbage', description: '' });
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('description', form.description);
      if (photo) formData.append('photo', photo);
      await createReport(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader title={t('report.title')} showLanguage />
      <main className="px-4 py-6">
        {success ? (
          <p className="rounded-2xl bg-green-50 p-4 text-green-800">{t('common.submit')} ✓</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">{t('report.category')}</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-xl border px-4 py-3">
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`report.categories.${c}`)}</option>)}
              </select>
            </label>
            <Input label={t('report.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} />
            {error && <p className="text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full py-4">{loading ? t('common.loading') : t('report.submit')}</Button>
          </form>
        )}
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
