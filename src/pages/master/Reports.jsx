import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, MapPin, MonitorSmartphone, User, EyeOff, Bell } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ImageModal from '../../components/ui/ImageModal.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { ReportsSkeleton } from '../../components/ui/Skeleton.jsx';
import * as masterApi from '../../api/masterApi.js';
import * as adminApi from '../../api/adminApi.js';

export default function MasterReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'anonymous'
  const [liveAlert, setLiveAlert] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadReports = useCallback(() => {
    masterApi
      .getReports()
      .then(({ data }) => setReports(data.data.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Real-time SSE listener for Master Admin reports
  useEffect(() => {
    const token = localStorage.getItem('beach_app_token');
    if (!token) return;

    let eventSource;
    try {
      const url = adminApi.getAdminReportEventsUrl(token);
      eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new-report' && data.report) {
            const newReport = data.report;
            setReports((prev) => [newReport, ...prev.filter((r) => r._id !== newReport._id)]);
            setLiveAlert(`🔔 New ${newReport.isAnonymous ? 'Anonymous' : 'User'} Beach Report: ${newReport.category}`);
            setTimeout(() => setLiveAlert(null), 6000);
          } else if (data.type === 'report-status-updated' && data.report) {
            const updatedReport = data.report;
            setReports((prev) => prev.map((r) => (r._id === updatedReport._id ? updatedReport : r)));
          }
        } catch {
          // JSON parse error
        }
      };
    } catch {
      // SSE connection error
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  const anonymousReports = useMemo(() => {
    return reports.filter((r) => r.isAnonymous || !r.submittedBy);
  }, [reports]);

  const userReports = useMemo(() => {
    return reports.filter((r) => !r.isAnonymous && r.submittedBy);
  }, [reports]);

  // Group User Reports by User ID into 1 Card per User
  const userReportGroups = useMemo(() => {
    const map = new Map();
    for (const r of userReports) {
      const uKey = typeof r.submittedBy === 'object' && r.submittedBy?._id ? r.submittedBy._id : String(r.submittedBy || 'unknown');
      if (!map.has(uKey)) {
        map.set(uKey, {
          userId: uKey,
          userInfo: typeof r.submittedBy === 'object' ? r.submittedBy : { name: 'Registered User' },
          reports: [],
        });
      }
      map.get(uKey).reports.push(r);
    }
    return Array.from(map.values());
  }, [userReports]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('nav.reports')}</h1>
          <p className="mt-1 text-sm text-zinc-500">Live monitoring of user and anonymous incident reports</p>
        </div>

        {/* Real-time SSE Live Alert Pill */}
        {liveAlert && (
          <div className="flex items-center gap-2 rounded-full bg-orange-500/20 border border-orange-500/40 px-4 py-2 text-xs font-medium text-orange-300 animate-pulse">
            <Bell className="h-4 w-4 text-orange-400" />
            <span>{liveAlert}</span>
          </div>
        )}
      </div>

      {/* Shadcn UI Tabs Bar: User Reports vs Anonymous Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto shrink-0">
        <TabsList className="h-10 w-auto bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1">
          <TabsTrigger value="user" className="h-8 gap-2 px-3.5 text-xs font-semibold rounded-lg transition-all">
            <User className="h-3.5 w-3.5" />
            <span>User Reports</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[11px] font-bold transition-colors ${
              activeTab === 'user' ? 'bg-white/28 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {userReports.length}
            </span>
          </TabsTrigger>

          <TabsTrigger value="anonymous" className="h-8 gap-2 px-3.5 text-xs font-semibold rounded-lg transition-all">
            <EyeOff className="h-3.5 w-3.5" />
            <span>Anonymous Reports</span>
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[11px] font-bold transition-colors ${
              activeTab === 'anonymous' ? 'bg-white/28 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {anonymousReports.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {loading ? (
          <ReportsSkeleton count={3} dark />
        ) : activeTab === 'user' ? (
          userReportGroups.length === 0 ? (

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
              <p className="font-semibold text-zinc-400">No user reports found</p>
              <p className="mt-1 text-xs text-zinc-600">New reports submitted under this view will appear automatically.</p>
            </div>
          ) : (
            userReportGroups.map((group) => (
              <div key={group.userId} className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-sm shadow-black/20 space-y-4">
                {/* User Profile Card Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 font-bold shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-white text-base">{group.userInfo.name}</span>
                      {group.userInfo.username && (
                        <span className="ml-2 text-xs font-semibold text-orange-400">(@{group.userInfo.username})</span>
                      )}
                      {group.userInfo.role && (
                        <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono">
                          {group.userInfo.role}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300 border border-orange-500/30">
                    {group.reports.length} {group.reports.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </div>

                {/* All Reports submitted by this User */}
                <div className="space-y-4">
                  {group.reports.map((r, index) => {
                    const hasLocation = r.location?.latitude != null && r.location?.longitude != null;
                    const mapsUrl = hasLocation
                      ? `https://www.google.com/maps?q=${r.location.latitude},${r.location.longitude}`
                      : null;

                    return (
                      <div key={r._id} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-500">#{index + 1}</span>
                              <p className="font-bold text-white text-base">{t(`report.categories.${r.category}`, r.category)}</p>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">Submitted: {new Date(r.createdAt).toLocaleString()}</p>
                          </div>
                          <StatusBadge status={r.status} label={t(`report.status.${r.status}`, r.status)} />
                        </div>

                        {r.description ? (
                          <p className="text-sm text-zinc-300 leading-relaxed">{r.description}</p>
                        ) : (
                          <p className="text-sm italic text-zinc-500">{t('report.noDescription')}</p>
                        )}

                        {r.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(r.photoUrl)}
                            className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-left"
                          >
                            <img
                              src={r.photoUrl}
                              alt="Report attachment"
                              className="h-48 w-full rounded-xl object-cover border border-zinc-800 transition-transform duration-200 group-hover:scale-102"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                              <span className="rounded-lg bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs">
                                Click to preview
                              </span>
                            </div>
                          </button>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2 pt-1 border-t border-zinc-800/50">
                          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-sm">
                            <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-200">
                              <MapPin className="h-4 w-4 text-orange-400" />
                              {t('report.location')}
                            </div>
                            {hasLocation ? (
                              <>
                                <p className="text-zinc-400 font-mono text-xs">
                                  {r.location.latitude.toFixed(6)}, {r.location.longitude.toFixed(6)}
                                </p>
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-300 hover:underline"
                                >
                                  {t('report.openMap')}
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </>
                            ) : (
                              <p className="text-zinc-500 text-xs">{t('report.locationUnavailable')}</p>
                            )}
                          </div>

                          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-sm">
                            <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-200">
                              <MonitorSmartphone className="h-4 w-4 text-orange-400" />
                              {t('report.deviceDetails')}
                            </div>
                            {r.deviceInfo ? (
                              <dl className="space-y-1 text-xs text-zinc-400">
                                <div>
                                  <dt className="inline font-medium text-zinc-300">Platform: </dt>
                                  <dd className="inline">{r.deviceInfo.platform || '—'}</dd>
                                </div>
                                <div>
                                  <dt className="inline font-medium text-zinc-300">Language: </dt>
                                  <dd className="inline">{r.deviceInfo.language || '—'}</dd>
                                </div>
                              </dl>
                            ) : (
                              <p className="text-zinc-500 text-xs">{t('report.deviceUnavailable')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        ) : (
          anonymousReports.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
              <p className="font-semibold text-zinc-400">No anonymous reports found</p>
              <p className="mt-1 text-xs text-zinc-600">New reports submitted under this view will appear automatically.</p>
            </div>
          ) : (
            anonymousReports.map((r) => {
              const hasLocation = r.location?.latitude != null && r.location?.longitude != null;
              const mapsUrl = hasLocation
                ? `https://www.google.com/maps?q=${r.location.latitude},${r.location.longitude}`
                : null;

              return (
                <div
                  key={r._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm shadow-black/20 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white text-lg">{t(`report.categories.${r.category}`, r.category)}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Submitted: {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={r.status} label={t(`report.status.${r.status}`, r.status)} />
                  </div>

                  {r.description ? (
                    <p className="text-sm text-zinc-300 leading-relaxed">{r.description}</p>
                  ) : (
                    <p className="text-sm italic text-zinc-500">{t('report.noDescription')}</p>
                  )}

                  {r.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(r.photoUrl)}
                      className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer text-left"
                    >
                      <img
                        src={r.photoUrl}
                        alt="Report attachment"
                        className="h-48 w-full rounded-xl object-cover border border-zinc-800 transition-transform duration-200 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                        <span className="rounded-lg bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs">
                          Click to preview
                        </span>
                      </div>
                    </button>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
                      <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-200">
                        <MapPin className="h-4 w-4 text-orange-400" />
                        {t('report.location')}
                      </div>
                      {hasLocation ? (
                        <>
                          <p className="text-zinc-400 font-mono text-xs">
                            {r.location.latitude.toFixed(6)}, {r.location.longitude.toFixed(6)}
                          </p>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-300 hover:underline"
                          >
                            {t('report.openMap')}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </>
                      ) : (
                        <p className="text-zinc-500 text-xs">{t('report.locationUnavailable')}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
                      <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-200">
                        <MonitorSmartphone className="h-4 w-4 text-orange-400" />
                        {t('report.deviceDetails')}
                      </div>
                      {r.deviceInfo ? (
                        <dl className="space-y-1 text-xs text-zinc-400">
                          <div>
                            <dt className="inline font-medium text-zinc-300">Platform: </dt>
                            <dd className="inline">{r.deviceInfo.platform || '—'}</dd>
                          </div>
                          <div>
                            <dt className="inline font-medium text-zinc-300">Language: </dt>
                            <dd className="inline">{r.deviceInfo.language || '—'}</dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-zinc-500 text-xs">{t('report.deviceUnavailable')}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
