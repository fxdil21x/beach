import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { User, EyeOff, Bell, MapPin, Monitor } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Button from '../../components/ui/Button.jsx';
import ImageModal from '../../components/ui/ImageModal.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '../../components/ui/pagination.jsx';
import { ReportsSkeleton } from '../../components/ui/Skeleton.jsx';
import { adminNav } from '../../config/navigation.js';
import * as adminApi from '../../api/adminApi.js';

const ITEMS_PER_PAGE = 5;

export default function AdminReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('user'); // 'anonymous' | 'user'
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [liveAlert, setLiveAlert] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      const { data } = await adminApi.getReports();
      setReports(data.data.reports || []);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Real-Time SSE Listener for Admin Reports Stream
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
            setLiveAlert(`🔔 New ${newReport.isAnonymous ? 'Anonymous' : 'User'} Report: ${newReport.category}`);
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

  const updateStatus = async (id, status) => {
    try {
      const { data } = await adminApi.updateReportStatus(id, status);
      if (data?.data?.report) {
        const updated = data.data.report;
        setReports((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      } else {
        loadReports();
      }
    } catch {
      // Ignore error
    }
  };

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

  const currentList = activeTab === 'anonymous' ? anonymousReports : userReportGroups;
  const totalPages = Math.max(1, Math.ceil(currentList.length / ITEMS_PER_PAGE));
  const paginatedList = currentList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <MobileHeader title={t('admin.reportsTitle')} showLanguage targetRole="admin" />

      {/* Real-time Alert Banner */}
      {liveAlert && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md animate-pulse shrink-0">
          <Bell className="h-4 w-4 shrink-0" />
          <span>{liveAlert}</span>
        </div>
      )}

      {/* Top Header Tabs & Justified Pagination Bar */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 shrink-0 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabSelect} className="w-full sm:w-auto">
            <TabsList className="h-9 w-full sm:w-auto grid grid-cols-2 sm:flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl gap-1">
              <TabsTrigger value="user" className="h-8 gap-1.5 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">User Reports</span>
                <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 rounded-full px-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'user' ? 'bg-white/28 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {userReports.length}
                </span>
              </TabsTrigger>

              <TabsTrigger value="anonymous" className="h-8 gap-1.5 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all">
                <EyeOff className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Anonymous</span>
                <span className={`inline-flex items-center justify-center min-w-[18px] h-4.5 rounded-full px-1 text-[10px] font-bold transition-colors ${
                  activeTab === 'anonymous' ? 'bg-white/28 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {anonymousReports.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Pagination Controls */}
          {currentList.length > 0 && totalPages > 1 && (
            <div className="flex justify-center sm:justify-end">
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="h-7 px-2 text-[11px]"
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1.5 whitespace-nowrap">
                      {currentPage} / {totalPages}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="h-7 px-2 text-[11px]"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-3.5 sm:px-4 py-4 pb-36">
        {loading ? (
          <ReportsSkeleton count={3} />
        ) : paginatedList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-gray-500 dark:text-slate-400">
            <p className="font-semibold text-gray-700 dark:text-slate-200">No {activeTab === 'anonymous' ? 'anonymous' : 'user'} reports found</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Reports submitted under this category will appear here in real time.</p>
          </div>
        ) : activeTab === 'user' ? (
          /* User Reports: Grouped into 1 Card per User */
          paginatedList.map((group) => (
            <div key={group.userId} className="rounded-2xl bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3.5 transition-colors">
              {/* User Profile Banner Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate leading-snug">
                      {group.userInfo.name}
                    </h3>
                    {group.userInfo.username && (
                      <p className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                        @{group.userInfo.username}
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60 whitespace-nowrap">
                  {group.reports.length} {group.reports.length === 1 ? 'Report' : 'Reports'}
                </span>
              </div>

              {/* List of Reports submitted by this specific User */}
              <div className="space-y-3">
                {group.reports.map((r, index) => (
                  <div key={r._id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 sm:p-3.5 space-y-3 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-400 shrink-0">#{index + 1}</span>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">{r.category}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={r.status} label={t(`report.status.${r.status}`, r.status)} />
                      </div>
                    </div>

                    {r.description ? (
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">{r.description}</p>
                    ) : (
                      <p className="text-xs italic text-slate-400 dark:text-slate-500">No text description provided</p>
                    )}

                    {r.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(r.photoUrl)}
                        className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-left"
                      >
                        <img src={r.photoUrl} alt="Incident attachment" className="h-36 sm:h-44 w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-102" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                          <span className="rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs">
                            Click to preview
                          </span>
                        </div>
                      </button>
                    )}

                    {/* Location & Device Info Snippets */}
                    {(r.location?.latitude != null || r.deviceInfo?.platform) && (
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        {r.location?.latitude != null && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5">
                            <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                            <span>{r.location.latitude.toFixed(4)}, {r.location.longitude.toFixed(4)}</span>
                          </span>
                        )}
                        {r.deviceInfo?.platform && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5">
                            <Monitor className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{r.deviceInfo.platform}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status Change Buttons */}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/60">
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Update Status:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'OPEN', label: 'Open' },
                          { id: 'IN_PROGRESS', label: 'In Progress' },
                          { id: 'RESOLVED', label: 'Resolved' },
                        ].map(({ id: s, label }) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateStatus(r._id, s)}
                            className={`rounded-xl py-2 px-1 text-[11px] sm:text-xs font-bold transition-all text-center whitespace-nowrap overflow-hidden text-ellipsis ${
                              r.status === s
                                ? s === 'RESOLVED'
                                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                                  : s === 'IN_PROGRESS'
                                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                                  : 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Anonymous Reports: Individual Incident Cards */
          paginatedList.map((r) => (
            <div key={r._id} className="rounded-2xl bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{r.category}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={r.status} label={t(`report.status.${r.status}`, r.status)} />
                </div>
              </div>

              {r.description ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">{r.description}</p>
              ) : (
                <p className="text-xs italic text-slate-400 dark:text-slate-500">No text description provided</p>
              )}

              {r.photoUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(r.photoUrl)}
                  className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-left"
                >
                  <img src={r.photoUrl} alt="Incident attachment" className="h-36 sm:h-44 w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-102" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                    <span className="rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs">
                      Click to preview
                    </span>
                  </div>
                </button>
              )}

              {/* Location & Device Info Snippets */}
              {(r.location?.latitude != null || r.deviceInfo?.platform) && (
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  {r.location?.latitude != null && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-2 py-0.5">
                      <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                      <span>{r.location.latitude.toFixed(4)}, {r.location.longitude.toFixed(4)}</span>
                    </span>
                  )}
                  {r.deviceInfo?.platform && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 px-2 py-0.5">
                      <Monitor className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{r.deviceInfo.platform}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Status Change Buttons */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/60">
                <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Update Status:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'OPEN', label: 'Open' },
                    { id: 'IN_PROGRESS', label: 'In Progress' },
                    { id: 'RESOLVED', label: 'Resolved' },
                  ].map(({ id: s, label }) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateStatus(r._id, s)}
                      className={`rounded-xl py-2 px-1 text-[11px] sm:text-xs font-bold transition-all text-center whitespace-nowrap overflow-hidden text-ellipsis ${
                        r.status === s
                          ? s === 'RESOLVED'
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                            : s === 'IN_PROGRESS'
                            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                            : 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <BottomNavigation items={adminNav} />
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
