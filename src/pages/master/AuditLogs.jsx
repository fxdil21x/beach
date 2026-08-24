import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  History,
  RefreshCw,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  User,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SearchInput from '../../components/ui/SearchInput.jsx';
import * as masterApi from '../../api/masterApi.js';

// Format relative time (e.g., "Just now", "2m ago", "1h ago")
function formatTimeAgo(dateString) {
  if (!dateString) return '—';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 10) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Action badge styling and icons
function getActionBadge(action) {
  switch (action) {
    case 'LOGIN':
      return {
        label: 'User Login',
        icon: LogIn,
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      };
    case 'LOGOUT':
      return {
        label: 'User Logout',
        icon: LogOut,
        className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      };
    case 'USER_REGISTERED':
      return {
        label: 'New Registration',
        icon: UserPlus,
        className: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      };
    case 'ADMIN_CREATED':
      return {
        label: 'Admin Created',
        icon: ShieldCheck,
        className: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      };
    case 'USER_ENABLED':
      return {
        label: 'User Enabled',
        icon: UserCheck,
        className: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      };
    case 'USER_DISABLED':
      return {
        label: 'User Disabled',
        icon: Shield,
        className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      };
    case 'USER_UPDATED':
      return {
        label: 'User Updated',
        icon: User,
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      };
    default:
      return {
        label: action ? action.replace(/_/g, ' ') : 'Action',
        icon: History,
        className: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      };
  }
}

// Role badge styling (strictly only USER and ADMIN)
function getRoleBadge(role) {
  switch (role) {
    case 'ADMIN':
      return { label: 'Safety Admin', className: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
    case 'USER':
      return { label: 'Resident User', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
    default:
      return { label: role || 'Resident', className: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
  }
}

// Extract human-readable device and OS details
function getDeviceDetails(metadata) {
  if (!metadata) return { icon: '💻', name: 'Web Browser', ip: '—', isMobile: false };

  const ip = metadata.ip || '—';

  if (metadata.device) {
    const isMobile = /📱|mobile|android|iphone|ipad/iu.test(metadata.device);
    return {
      icon: isMobile ? '📱' : '💻',
      name: metadata.device.replace(/^[📱💻\s]+/u, ''),
      ip,
      isMobile,
    };
  }

  const ua = metadata.userAgent || '';
  if (ua) {
    let os = 'Desktop';
    if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone/i.test(ua)) os = 'iPhone';
    else if (/ipad/i.test(ua)) os = 'iPad';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    let browser = 'Browser';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

    const isMobile = /mobile|android|iphone|ipad|phone/i.test(ua);
    return {
      icon: isMobile ? '📱' : '💻',
      name: `${os} • ${browser}`,
      ip,
      isMobile,
    };
  }

  return { icon: '🌐', name: 'Web Session', ip, isMobile: false };
}

const TABS = [
  { id: 'ALL', label: 'All Users & Admins', icon: History },
  { id: 'LOGIN', label: 'User Logins', icon: LogIn },
  { id: 'USER_REGISTERED', label: 'Registrations', icon: UserPlus },
  { id: 'ADMIN_EVENTS', label: 'Safety Admin Events', icon: Shield },
];

export default function MasterActivityLogs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const fetchLogs = useCallback(
    async (page = 1, query = searchQuery, tab = activeTab) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
        };

        if (query && query.trim()) {
          params.search = query.trim();
        }

        if (tab === 'LOGIN') {
          params.action = 'LOGIN';
        } else if (tab === 'USER_REGISTERED') {
          params.action = 'USER_REGISTERED';
        } else if (tab === 'ADMIN_EVENTS') {
          params.role = 'ADMIN';
        }

        const { data } = await masterApi.getAuditLogs(params);
        // Exclude any MASTER_ADMIN activity
        const filteredLogs = (data.data.logs || []).filter(
          (l) => l.role !== 'MASTER_ADMIN' && l.performedBy?.role !== 'MASTER_ADMIN'
        );
        setLogs(filteredLogs);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.limit, searchQuery, activeTab]
  );

  useEffect(() => {
    fetchLogs(1, searchQuery, activeTab);
  }, [activeTab]);

  const handleSearch = (q) => {
    setSearchQuery(q);
    fetchLogs(1, q, activeTab);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs(pagination.page, searchQuery, activeTab);
  };

  // Top 10 latest activities (strictly User & Admin only)
  const latestTen = useMemo(() => {
    return logs.slice(0, 10);
  }, [logs]);

  // Summary counts
  const loginCount = useMemo(() => logs.filter((l) => l.action === 'LOGIN').length, [logs]);
  const registerCount = useMemo(() => logs.filter((l) => l.action === 'USER_REGISTERED').length, [logs]);
  const adminEventCount = useMemo(() => logs.filter((l) => l.role === 'ADMIN').length, [logs]);

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/20">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                User & Admin Activity Logs
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Live monitoring of resident user logins, registrations, and safety officer activity with device details
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 shadow-sm hover:bg-zinc-800 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Total Tracked</span>
            <History className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{pagination.total || logs.length}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>User Logins (Page)</span>
            <LogIn className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">{loginCount}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Registrations (Page)</span>
            <UserPlus className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-sky-400">{registerCount}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Admin Events</span>
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400">{adminEventCount}</p>
        </div>
      </div>

      {/* ── Top 10 Latest Activities Highlight Banner (User & Admin Only) ── */}
      {latestTen.length > 0 && !searchQuery && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300">
                Latest 10 Activities (User & Admin)
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">Real-time Order</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {latestTen.slice(0, 5).map((log) => {
              const badge = getActionBadge(log.action);
              const userName = log.performedBy?.name || log.metadata?.name || 'Resident User';
              const device = getDeviceDetails(log.metadata);

              return (
                <div
                  key={log._id}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-2.5 text-xs transition-colors hover:border-zinc-700"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 font-bold uppercase text-[11px]">
                    {userName.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{userName}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded border text-[9px] font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(log.createdAt)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                      {device.icon} {device.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Search & Filter Tabs ── */}
      <div className="shrink-0 space-y-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-800/80">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search by Name / Username / Device */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 sm:p-4">
          <SearchInput
            placeholder="Search by resident name, username, device, OS, or IP address..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* ── Activity Logs Card (Table + Clean Integrated Footer) ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm border-collapse">
            <thead className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 select-none">
              <tr>
                <th className="p-3.5 pl-5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">User</th>
                <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">Role</th>
                <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">Action Performed</th>
                <th className="p-3.5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">Timestamp</th>
                <th className="p-3.5 pr-5 font-semibold text-xs uppercase tracking-wider text-zinc-400 whitespace-nowrap">Device & IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-orange-400" />
                      <span>Loading activity logs...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="h-8 w-8 text-zinc-600 stroke-[1.5]" />
                      <p className="text-sm font-medium text-zinc-400">No user or admin activity logs found</p>
                      <p className="text-xs text-zinc-600">
                        {searchQuery ? `No results matching "${searchQuery}"` : 'User and admin login activity will stream here in real-time.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const roleBadge = getRoleBadge(log.role || log.performedBy?.role);
                  const ActionIcon = badge.icon;
                  const userName = log.performedBy?.name || log.metadata?.name || 'Resident User';
                  const username = log.performedBy?.username || log.metadata?.username || '';
                  const device = getDeviceDetails(log.metadata);

                  return (
                    <tr
                      key={log._id}
                      className="text-zinc-200 hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* User details */}
                      <td className="p-3.5 pl-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 text-xs font-bold text-white shadow-sm">
                            {userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[180px]">{userName}</p>
                            {username && <p className="text-[11px] text-zinc-500 font-mono">@{username}</p>}
                          </div>
                        </div>
                      </td>

                      {/* User Role */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${roleBadge.className}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          <ActionIcon className="h-3.5 w-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="p-3.5 whitespace-nowrap text-zinc-300">
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">{formatTimeAgo(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Device & IP Details */}
                      <td className="p-3.5 pr-5 whitespace-nowrap text-zinc-400">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-medium">
                            <span className="text-sm">{device.icon}</span>
                            <span>{device.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                            <Globe className="h-3 w-3 text-zinc-600 shrink-0" />
                            <span>{device.ip}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer with Record Summary & Pagination Controls ── */}
        <div className="border-t border-zinc-800 bg-zinc-950/60 px-4 py-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-zinc-400 text-center sm:text-left">
            Showing <span className="font-semibold text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-semibold text-white">{pagination.total}</span> logs
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchLogs(pagination.page - 1)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-medium text-zinc-400 font-mono">
              <span className="text-white font-bold">{pagination.page}</span> / <span className="text-white font-bold">{pagination.pages || 1}</span>
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.pages || loading}
              onClick={() => fetchLogs(pagination.page + 1)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
