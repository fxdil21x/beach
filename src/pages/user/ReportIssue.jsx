import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Bell, CheckCircle2, FileText, PlusCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Input from '../../components/ui/Input.jsx';
import ImageModal from '../../components/ui/ImageModal.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay.jsx';
import { ReportsSkeleton } from '../../components/ui/Skeleton.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { userNav } from '../../config/navigation.js';
import { createReport, getMyReports, getUserReportEventsUrl } from '../../api/reportApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import reportsBannerImg from '../../assets/banners/reports-banner.jpg';

const CATEGORIES = ['Garbage', 'Overflowing Bin', 'Unsafe Driving', 'Damaged Facility', 'Noise Problem', 'Safety Issue', 'Other'];
const ITEMS_PER_PAGE = 5;

export default function UserReportIssue() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const accentColor = appearance.accentColor || '#0284C7';

  const [activeTab, setActiveTab] = useState(user ? 'my-reports' : 'submit');
  const [currentPage, setCurrentPage] = useState(1)
  const [form, setForm] = useState({ category: 'Garbage', description: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // User Reports State
  const [myReports, setMyReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchUserReports = useCallback(async () => {
    if (!user) return;
    setReportsLoading(true);
    try {
      const { data } = await getMyReports();
      setMyReports(data.data.reports || []);
    } catch {
      // Ignore
    } finally {
      setReportsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserReports();
  }, [fetchUserReports]);

  // SSE Listener for logged in User to get real-time notifications when Admin updates report status
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('beach_app_token');
    if (!token) return;

    let eventSource;
    try {
      const url = getUserReportEventsUrl(token);
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'report-status-updated' && data.report) {
            const updatedReport = data.report;
            setMyReports((prev) => prev.map((r) => (r._id === updatedReport._id ? updatedReport : r)));
            setNotification(`🔔 Your report status changed to: ${updatedReport.status.replace('_', ' ')}`);
            setTimeout(() => setNotification(null), 6000);
          }
        } catch {
          // JSON parse error
        }
      };
    } catch {
      // SSE error
    }

    return () => {
      eventSource?.close();
    };
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('category', form.category);
      if (form.description) formData.append('description', form.description);
      if (photo) formData.append('photo', photo);
      // Express explicit logged in status
      formData.append('forceAnonymous', 'false');

      await createReport(formData);
      setSuccess(true);
      setForm({ category: 'Garbage', description: '' });
      setPhoto(null);
      setPhotoPreview(null);
      fetchUserReports();
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(myReports.length / ITEMS_PER_PAGE));
  const paginatedMyReports = myReports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="relative flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <TabMaintenanceOverlay tabId="report" fallbackTitle="Issue Reporting Under Maintenance" />
      <MobileHeader title={t('report.title')} showLanguage />

      {/* Top Header Tabs & Justified Pagination Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 shrink-0 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }} className="w-auto">
            <TabsList className="h-10 w-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1">
              <TabsTrigger value="submit" className="h-8 gap-2 px-3.5 text-xs font-semibold rounded-lg transition-all">
                <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{t('report.submit')}</span>
              </TabsTrigger>

              {user && (
                <TabsTrigger value="my-reports" className="h-8 gap-2 px-3.5 text-xs font-semibold rounded-lg transition-all">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span>My Reports</span>
                  {myReports.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[11px] font-bold transition-colors"
                      style={{
                        backgroundColor: activeTab === 'my-reports' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(226, 232, 240, 0.8)',
                        color: activeTab === 'my-reports' ? '#ffffff' : '#475569',
                      }}
                    >
                      {myReports.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Right Justified Top Pagination Controls */}
          {activeTab === 'my-reports' && myReports.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2 text-[11px] font-semibold"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                Prev
              </Button>

              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-1.5 whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2 text-[11px] font-semibold"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <main className="relative flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-32 space-y-4">

        <BeachBanner
          badge="Beach Safety & Quality"
          title="Community Reports"
          subtitle="Report beach hazards, unsafe driving, waste disposal issues, or track your submitted tickets."
          image={reportsBannerImg}
        />

        {/* Real-time Notification Banner */}
        {notification && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-amber-500 p-4 text-white shadow-lg animate-bounce">
            <Bell className="h-5 w-5 shrink-0" />
            <p className="text-sm font-semibold">{notification}</p>
          </div>
        )}

        {/* Tab 1: Submit Report Form */}
        {activeTab === 'submit' && (
          <div>
            {success ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 text-center shadow-sm">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('report.successTitle')}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{t('report.successHint')}</p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button onClick={() => setSuccess(false)}>{t('report.submitAnother')}</Button>
                  {user && (
                    <Button variant="secondary" onClick={() => setActiveTab('my-reports')}>
                      View My Reports
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm">
                <div className="w-full space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('report.category')}
                  </label>
                  <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
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

                <Input
                  label="Description (Optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue at the beach..."
                />

                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Add Photo (Optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPhoto(file);
                      if (file) {
                        setPhotoPreview(URL.createObjectURL(file));
                      } else {
                        setPhotoPreview(null);
                      }
                    }}
                    className="block w-full text-xs text-gray-500 dark:text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 dark:file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer"
                  />

                  {photoPreview && (
                    <div className="relative mt-2 inline-block">
                      <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover border border-gray-200 dark:border-slate-700 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/60">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-base shadow-md hover:brightness-110 transition-all cursor-pointer text-white"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 14px ${appearance.glowColor || 'rgba(2, 132, 199, 0.35)'}`,
                  }}
                >
                  {loading ? t('common.loading', 'Submitting...') : t('report.submit', 'Submit Report')}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: My Reports List */}
        {activeTab === 'my-reports' && (
          <div className="space-y-4">
            {reportsLoading ? (
              <ReportsSkeleton count={2} />
            ) : myReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-gray-500 dark:text-slate-400">
                <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400 dark:text-slate-500" />
                <p className="font-semibold text-gray-700 dark:text-slate-200">No reported issues yet</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Reports submitted while logged in will appear here with live updates from gate admins.</p>
                <Button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 text-xs"
                >
                  Submit a Report
                </Button>
              </div>
            ) : (
              paginatedMyReports.map((r) => (
                <div key={r._id} className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{r.category}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={r.status} label={t(`report.status.${r.status}`, r.status)} />
                  </div>

                  {r.description && <p className="text-sm text-gray-700 dark:text-slate-300">{r.description}</p>}

                  {r.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(r.photoUrl)}
                      className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-left"
                    >
                      <img src={r.photoUrl} alt="Report attachment" className="h-40 w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-102" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                        <span className="rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs">
                          Click to preview
                        </span>
                      </div>
                    </button>
                  )}

                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/50 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700 dark:text-slate-300">Official Admin Response Status:</span>
                      <span
                        className="font-bold px-2 py-0.5 rounded-md transition-colors"
                        style={
                          r.status === 'RESOLVED'
                            ? { backgroundColor: '#d1fae5', color: '#065f46' }
                            : r.status === 'IN_PROGRESS'
                            ? { backgroundColor: `${accentColor}20`, color: accentColor }
                            : { backgroundColor: '#fef3c7', color: '#92400e' }
                        }
                      >
                        {r.status === 'OPEN' && '⏳ PENDING REVIEW'}
                        {r.status === 'IN_PROGRESS' && '🚨 IN PROGRESS'}
                        {r.status === 'RESOLVED' && '✅ RESOLVED'}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                      {r.status === 'OPEN' && 'Your report has been received by Gate Officers and is currently pending review.'}
                      {r.status === 'IN_PROGRESS' && 'Gate security officers are actively investigating and resolving this issue on site.'}
                      {r.status === 'RESOLVED' && 'This issue has been inspected, addressed, and officially resolved by beach management. Thank you!'}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-slate-700 text-[11px] text-gray-400 dark:text-slate-500">
                      <span>Report ID: #{r._id?.slice(-6).toUpperCase()}</span>
                      <span>Last Updated: {new Date(r.updatedAt || r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <BottomNavigation items={userNav} />
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
