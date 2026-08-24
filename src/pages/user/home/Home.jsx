import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TriangleAlert, ShieldCheck } from 'lucide-react';
import MobileHeader from '../../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../../components/layout/BottomNavigation.jsx';
import Button from '../../../components/ui/Button.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs.jsx';
import ResidentSearchPanel from '../../../components/resident/ResidentSearchPanel.jsx';
import ResidentPassForm from '../../../components/resident/ResidentPassForm.jsx';
import ResidentPhoneLoginForm from '../../../components/resident/ResidentPhoneLoginForm.jsx';
import ResidentQrPanel from '../../../components/resident/ResidentQrPanel.jsx';
import EmergencyButton from '../../../components/ui/EmergencyButton.jsx';
import BeachBanner from '../../../components/common/BeachBanner.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../../context/FeatureContext.jsx';
import { userNav } from '../../../config/navigation.js';
import * as publicApi from '../../../api/publicApi.js';
import * as passApi from '../../../api/residentPassApi.js';

import heroBannerImage from '../../public/image/Gemini_Generated_Image_kxdt3pkxdt3pkxdt.png';

export default function UserHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setSession, logout } = useAuth();
  const { featureSettings } = useFeatureSettings();
  const isResident = Boolean(user?.residentPassId);

  const showReportButton = user ? featureSettings.userReportEnabled : featureSettings.publicReportEnabled;
  const showEmergencySos = Boolean(user) && featureSettings.emergencySosEnabled;
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
    setSession(payload.accessToken || payload.token, payload.user, payload.refreshToken);
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

  const handleLogout = () => {
    logout();
    setPass(null);
    setSelected(null);
    navigate('/user/home', { replace: true });
  };

  const showPass = isResident && pass;

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader
        title={t('nav.home')}
        showLanguage
        action={
          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
            {user ? (
              <Button variant="secondary" size="sm" onClick={handleLogout} className="shrink-0">
                {t('common.logout')}
              </Button>
            ) : (
              <Link to="/entry" className="shrink-0">
                <Button variant="default" size="sm" className="shrink-0">
                  {t('common.guest')}
                </Button>
              </Link>
            )}
          </div>
        }
      />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6">
        <BeachBanner
          badge="Muzhappilangad Drive-In Beach"
          title={t('beach.welcome')}
          subtitle={`${t('beach.name')} — Asia's premier drive-in beach entrance system.`}
          image={heroBannerImage}
        >
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {showReportButton && (
              <Link
                to="/user/report"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 border border-white/30 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30 transition-all shadow-xs"
              >
                <TriangleAlert className="h-3.5 w-3.5 text-amber-300" />
                <span>{t('report.reportButton', 'Report Issue')}</span>
              </Link>
            )}

            <Link
              to="/user/beach-rules"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/25 border border-amber-400/40 px-3.5 py-2 text-xs font-bold text-amber-200 backdrop-blur-md hover:bg-amber-500/35 transition-all shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
              <span>{t('nav.beachRules', 'Beach Safety Rules')}</span>
            </Link>
          </div>
        </BeachBanner>

        {showEmergencySos && <EmergencyButton />}

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
            <div className="mb-5">
              <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="h-11 w-full bg-slate-100 p-1">
                  <TabsTrigger value="register" className="h-9 text-xs sm:text-sm font-semibold">
                    {t('resident.registerTab')}
                  </TabsTrigger>
                  <TabsTrigger value="login" className="h-9 text-xs sm:text-sm font-semibold">
                    {t('resident.loginTab')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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
      <BottomNavigation items={userNav} />
    </div>
  );
}
