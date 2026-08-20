import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, MapPin, TriangleAlert, X } from 'lucide-react';
import LanguageSwitcher from '../../components/language/LanguageSwitcher.jsx';
import Button from '../../components/ui/Button.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select.jsx';
import { createReport } from '../../api/reportApi.js';

const CATEGORIES = [
  'Garbage',
  'Overflowing Bin',
  'Unsafe Driving',
  'Damaged Facility',
  'Noise Problem',
  'Safety Issue',
  'Other',
];

function collectDeviceInfo() {
  return {
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    language: navigator.language || '',
    vendor: navigator.vendor || '',
    screenWidth: window.screen?.width || null,
    screenHeight: window.screen?.height || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  };
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

export default function PublicIssueReport() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [category, setCategory] = useState('Garbage');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getLocation().then(setLocation);
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!photo && !description.trim()) {
      setError(t('report.photoOrDescription'));
      return;
    }

    setLoading(true);
    try {
      const liveLocation = location || (await getLocation());
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      const hasUserToken = Boolean(localStorage.getItem('beach_app_token'));
      formData.append('forceAnonymous', hasUserToken ? 'false' : 'true');
      formData.append('deviceInfo', JSON.stringify(collectDeviceInfo()));
      if (liveLocation) {
        formData.append('latitude', String(liveLocation.latitude));
        formData.append('longitude', String(liveLocation.longitude));
        if (liveLocation.accuracy != null) {
          formData.append('accuracy', String(liveLocation.accuracy));
        }
      }
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
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Link to="/user/home" className="text-sm font-medium text-blue-600">
            {t('common.back')}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-6 w-6" />
            <h1 className="text-xl font-bold">{t('report.title')}</h1>
          </div>
          <p className="mt-2 text-sm opacity-90">{t('report.anonymousHint')}</p>
        </div>

        {success ? (
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-semibold text-green-700">{t('report.submitSuccess')}</p>
            <Link to="/user/home">
              <Button className="mt-4 w-full">{t('nav.home')}</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                {t('report.category')}
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`report.categories.${c}`, c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">{t('report.takePhoto')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 py-3"
              >
                <Camera className="h-5 w-5" />
                {photo ? t('report.retakePhoto') : t('report.openCamera')}
              </Button>
              {preview && (
                <div className="relative mt-3 block overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={preview}
                    alt="Report preview"
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPreview(null); }}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110 active:scale-95"
                    title="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {t('report.descriptionOptional')}
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t('report.descriptionPlaceholder')}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-500"
              />
            </label>

            <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {location
                  ? t('report.locationCaptured')
                  : t('report.locationPending')}
              </span>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full py-4 text-base">
              {loading ? t('common.loading') : t('report.submit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
