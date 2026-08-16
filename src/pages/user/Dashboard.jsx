import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ResidentSearchPanel from '../../components/resident/ResidentSearchPanel.jsx';
import ResidentPassForm from '../../components/resident/ResidentPassForm.jsx';
import ResidentPhoneLoginForm from '../../components/resident/ResidentPhoneLoginForm.jsx';
import ResidentQrPanel from '../../components/resident/ResidentQrPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import * as publicApi from '../../api/publicApi.js';
import * as passApi from '../../api/residentPassApi.js';

export default function UserDashboard() {
  const { t } = useTranslation();
  const { user, setSession, logout } = useAuth();
  const isResident = Boolean(user?.residentPassId);
  const [tab, setTab] = useState('register');
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pass, setPass] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  const loadPass = useCallback(async () => {
    if (!user?.residentPassId) {
      setPass(null);
      setQrToken('');
      return;
    }
    try {
      const { data } = await passApi.getMyPass();
      const passData = data.data.pass;
      setPass(passData);
      if (passData?.isActive) {
        const qrRes = await passApi.getMyQr();
        setQrToken(qrRes.data.data.qrToken);
      } else {
        setQrToken('');
      }
    } catch {
      setPass(null);
      setQrToken('');
    }
  }, [user?.residentPassId]);

  useEffect(() => {
    loadPass();
  }, [loadPass]);

  const resetFlow = () => {
    setSelected(null);
    setError('');
    setCredentials(null);
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    resetFlow();
  };

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearched(true);
    setError('');
    resetFlow();
    try {
      const { data } = await publicApi.searchResidents(query.trim());
      setRecords(data.data.records);
    } catch {
      setRecords([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (resident) => {
    setSelected(resident);
    setError('');
  };

  const applySession = (payload) => {
    setSession(payload.token, payload.user);
    setPass(payload.pass);
    setQrToken(payload.qrToken);
  };

  const handleRegister = async ({ phone, photo }) => {
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('residentRecordId', selected.id);
      formData.append('phone', phone);
      if (photo) formData.append('photo', photo);
      const { data } = await publicApi.registerResidentPass(formData);
      const payload = data.data;
      applySession(payload);
      setCredentials(payload.credentials);
      setSelected(null);
      setRecords([]);
      setQuery('');
      setSearched(false);
    } catch (err) {
      const message = err.response?.data?.message || t('common.error');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async ({ phone }) => {
    setSubmitting(true);
    setError('');
    try {
      const { data } = await publicApi.loginResident({
        residentRecordId: selected.id,
        phone,
      });
      const payload = data.data;
      applySession(payload);
      setSelected(null);
      setRecords([]);
      setQuery('');
      setSearched(false);
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === 'NOT_REGISTERED') {
        setError(t('resident.notRegistered'));
      } else if (code === 'PHONE_MISMATCH') {
        setError(t('resident.phoneMismatch'));
      } else {
        setError(err.response?.data?.message || t('common.error'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadPhoto = async (file) => {
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError('');
    setPhotoSuccess('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await passApi.updateMyPhoto(formData);
      setPass(data.data.pass);
      setPhotoSuccess(t('resident.photoUpdated'));
    } catch (err) {
      setPhotoError(err.response?.data?.message || t('common.error'));
    } finally {
      setPhotoUploading(false);
    }
  };

  const showPass = isResident && pass;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader
        title={t('nav.home')}
        showLanguage
        action={
          <div className="flex max-w-[11rem] flex-wrap items-center justify-end gap-1.5 sm:max-w-none">
            {isResident && (
              <Button variant="secondary" onClick={logout} className="px-2.5 py-2 text-xs sm:px-3 sm:text-sm">
                {t('common.logout')}
              </Button>
            )}
            <Link
              to="/entry"
              className="rounded-xl bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white sm:px-3 sm:text-sm"
            >
              {t('common.guest')}
            </Link>
          </div>
        }
      />
      <main className="space-y-4 px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white sm:p-6">
          <h2 className="text-xl font-bold leading-snug sm:text-2xl">{t('beach.welcome')}</h2>
          <p className="mt-2 text-sm opacity-90 sm:text-base">{t('beach.name')}</p>
          <Link
            to="/report"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
          >
            <TriangleAlert className="h-4 w-4" />
            {t('report.reportButton')}
          </Link>
        </div>

        {showPass ? (
          <ResidentQrPanel
            pass={pass}
            qrToken={qrToken}
            credentials={credentials}
            onUploadPhoto={handleUploadPhoto}
            photoUploading={photoUploading}
            photoError={photoError}
            photoSuccess={photoSuccess}
          />
        ) : (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`min-w-0 flex-1 rounded-lg px-2 py-2.5 text-center text-xs font-semibold leading-snug transition sm:text-sm ${
                  tab === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                }`}
              >
                {t('resident.registerTab')}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`min-w-0 flex-1 rounded-lg px-2 py-2.5 text-center text-xs font-semibold leading-snug transition sm:text-sm ${
                  tab === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'
                }`}
              >
                {t('resident.loginTab')}
              </button>
            </div>

            {!selected && (
              <ResidentSearchPanel
                query={query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                records={records}
                searching={searching}
                searched={searched}
                onSelect={handleSelect}
                disableRegistered={tab === 'register'}
              />
            )}

            {selected && tab === 'register' && (
              <div className="space-y-4">
                <Button variant="secondary" onClick={resetFlow} className="w-full">
                  {t('common.back')}
                </Button>
                <ResidentPassForm
                  resident={selected}
                  onSubmit={handleRegister}
                  loading={submitting}
                  error={error}
                />
              </div>
            )}

            {selected && tab === 'login' && (
              <div className="space-y-4">
                <Button variant="secondary" onClick={resetFlow} className="w-full">
                  {t('common.back')}
                </Button>
                <ResidentPhoneLoginForm
                  resident={selected}
                  onSubmit={handleLogin}
                  loading={submitting}
                  error={error}
                />
                {error === t('resident.notRegistered') && (
                  <Button onClick={() => handleTabChange('register')} className="w-full">
                    {t('resident.goToRegister')}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
