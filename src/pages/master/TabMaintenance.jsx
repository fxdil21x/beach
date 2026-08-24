import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Construction,
  TriangleAlert,
  ShieldAlert,
  Clock,
  Radio,
  Lock,
  Sparkles,
  Bell,
  Car,
  Utensils,
  Info,
  Flame,
  CheckCircle2,
  X,
  Edit2,
  Sliders,
  Shield,
  Eye,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import Button from '../../components/ui/Button.jsx';

const AVAILABLE_ICONS = [
  { id: 'Wrench', label: 'Wrench / Tools', icon: Wrench, color: 'text-amber-400' },
  { id: 'Construction', label: 'Construction', icon: Construction, color: 'text-orange-400' },
  { id: 'AlertTriangle', label: 'Alert Warning', icon: TriangleAlert, color: 'text-yellow-400' },
  { id: 'ShieldAlert', label: 'Security & SOS', icon: ShieldAlert, color: 'text-red-400' },
  { id: 'Clock', label: 'Clock / Time', icon: Clock, color: 'text-blue-400' },
  { id: 'Radio', label: 'Broadcast Radio', icon: Radio, color: 'text-purple-400' },
  { id: 'Lock', label: 'Locked / Closed', icon: Lock, color: 'text-rose-400' },
  { id: 'Sparkles', label: 'Feature Upgrade', icon: Sparkles, color: 'text-emerald-400' },
  { id: 'Bell', label: 'Notification Bell', icon: Bell, color: 'text-cyan-400' },
  { id: 'Car', label: 'Rides & Auto', icon: Car, color: 'text-amber-400' },
  { id: 'Utensils', label: 'Food & Dining', icon: Utensils, color: 'text-orange-400' },
  { id: 'Info', label: 'Information', icon: Info, color: 'text-indigo-400' },
  { id: 'Flame', label: 'Urgent Alert', icon: Flame, color: 'text-rose-500' },
];

const PRESETS = [
  {
    label: 'Routine Maintenance',
    icon: 'Wrench',
    title: 'Feature Under Maintenance',
    description: 'We are performing routine server optimizations. This feature will be back shortly.',
  },
  {
    label: 'System Upgrade',
    icon: 'Sparkles',
    title: 'Upgrading to New Version',
    description: 'A major feature enhancement is being deployed to improve your experience.',
  },
  {
    label: 'High Tide / Weather',
    icon: 'AlertTriangle',
    title: 'Weather & Tide Advisory Pause',
    description: 'This service is temporarily paused due to beach weather conditions and high tide safety.',
  },
  {
    label: 'Gate Inspection',
    icon: 'Lock',
    title: 'Gate Pass System Under Sync',
    description: 'Entry gate scanners are synchronizing database records. Please show physical verification.',
  },
];

const TABS_CONFIG = [
  {
    id: 'report',
    name: 'My Reports & Issue Reporting',
    route: '/user/report',
    badge: 'Reports Tab',
    defaultTitle: 'Issue Reporting Under Maintenance',
    defaultDesc: 'Reporting is temporarily paused for routine server maintenance. Please check back soon.',
    defaultIcon: 'Wrench',
  },
  {
    id: 'services',
    name: 'Beach Services & Rides Directory',
    route: '/user/services',
    badge: 'Services Tab',
    defaultTitle: 'Services Directory Under Update',
    defaultDesc: 'The services and auto rides directory is undergoing scheduled updates.',
    defaultIcon: 'Car',
  },
  {
    id: 'my-pass',
    name: 'Digital Resident Gate Pass',
    route: '/user/my-pass',
    badge: 'My Pass Tab',
    defaultTitle: 'Gate Pass System Under Maintenance',
    defaultDesc: 'Pass verification and QR scanning systems are currently undergoing updates.',
    defaultIcon: 'Lock',
  },
  {
    id: 'my-visits',
    name: 'My Visits & Access Log',
    route: '/user/my-visits',
    badge: 'Visits Tab',
    defaultTitle: 'Visit Log Synchronization',
    defaultDesc: 'Access history database synchronization is currently in progress.',
    defaultIcon: 'Clock',
  },
  {
    id: 'beach-rules',
    name: 'Beach Safety & Guidelines',
    route: '/user/beach-rules',
    badge: 'Rules Tab',
    defaultTitle: 'Safety Guidelines Under Revision',
    defaultDesc: 'Safety rules and driving guidelines are being updated by beach administration.',
    defaultIcon: 'ShieldAlert',
  },
];

export default function TabMaintenance() {
  const { t } = useTranslation();
  const { featureSettings, updateFeatures, loading } = useFeatureSettings();

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Edit Modal State
  const [selectedTab, setSelectedTab] = useState(null);
  const [editForm, setEditForm] = useState({
    tabId: '',
    title: '',
    description: '',
    icon: 'Wrench',
    isBlocked: false,
  });

  const tabList = useMemo(() => {
    const serverTabs = featureSettings.tabMaintenance || [];
    return TABS_CONFIG.map((cfg) => {
      const match = serverTabs.find((st) => st.tabId === cfg.id);
      return {
        ...cfg,
        isBlocked: Boolean(match?.isBlocked),
        title: match?.title || cfg.defaultTitle,
        description: match?.description || cfg.defaultDesc,
        icon: match?.icon || cfg.defaultIcon,
      };
    });
  }, [featureSettings.tabMaintenance]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenEditModal = (tab) => {
    setSelectedTab(tab);
    setEditForm({
      tabId: tab.id,
      title: tab.title,
      description: tab.description,
      icon: tab.icon,
      isBlocked: tab.isBlocked,
    });
  };

  const handleApplyPreset = (preset) => {
    setEditForm((prev) => ({
      ...prev,
      icon: preset.icon,
      title: preset.title,
      description: preset.description,
    }));
  };

  // Quick 1-click toggle for active/maintenance
  const handleQuickToggle = async (tab) => {
    try {
      setSaving(true);
      const serverTabs = [...(featureSettings.tabMaintenance || [])];
      const index = serverTabs.findIndex((st) => st.tabId === tab.id);

      const updatedTab = {
        tabId: tab.id,
        title: tab.title,
        description: tab.description,
        icon: tab.icon,
        isBlocked: !tab.isBlocked,
        updatedAt: new Date(),
      };

      if (index >= 0) {
        serverTabs[index] = updatedTab;
      } else {
        serverTabs.push(updatedTab);
      }

      await updateFeatures({ tabMaintenance: serverTabs });
      showToast(
        !tab.isBlocked
          ? `${tab.name} is now BLOCKED with Maintenance Overlay`
          : `${tab.name} is now LIVE for all users`
      );
    } catch (err) {
      console.error(err);
      showToast('Failed to update tab status', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Modal Changes
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.description.trim()) {
      showToast('Please provide both title and description', 'error');
      return;
    }

    try {
      setSaving(true);
      const serverTabs = [...(featureSettings.tabMaintenance || [])];
      const index = serverTabs.findIndex((st) => st.tabId === editForm.tabId);

      const updatedTab = {
        tabId: editForm.tabId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        icon: editForm.icon,
        isBlocked: editForm.isBlocked,
        updatedAt: new Date(),
      };

      if (index >= 0) {
        serverTabs[index] = updatedTab;
      } else {
        serverTabs.push(updatedTab);
      }

      await updateFeatures({ tabMaintenance: serverTabs });
      showToast(`Maintenance settings for ${selectedTab?.name} updated!`);
      setSelectedTab(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to save maintenance settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const SelectedIconComp = AVAILABLE_ICONS.find((i) => i.id === editForm.icon)?.icon || Wrench;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 text-zinc-100 sm:p-6 lg:p-8">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl animate-in slide-in-from-top-4 ${
            notification.type === 'error'
              ? 'bg-rose-500 text-white'
              : 'bg-emerald-500 text-white'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider">
            <Sliders className="h-4 w-4" />
            <span>Master Admin Controls</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Tab Maintenance & Lock Controls
          </h1>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm max-w-2xl">
            Choose any user tab to suspend with a sleek blurred background, centered animated icon,
            and custom maintenance explanation. Users will not be able to perform actions on locked tabs.
          </p>
        </div>
      </div>

      {/* 5 Tab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabList.map((tab) => {
          const IconComp = AVAILABLE_ICONS.find((i) => i.id === tab.icon)?.icon || Wrench;

          return (
            <div
              key={tab.id}
              className={`flex flex-col justify-between rounded-3xl border p-5 transition-all ${
                tab.isBlocked
                  ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-950/20'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header with Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {tab.badge}
                  </span>

                  {tab.isBlocked ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      BLOCKED / MAINTENANCE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      ACTIVE / LIVE
                    </span>
                  )}
                </div>

                {/* Tab Title */}
                <div className="mt-3.5 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                      tab.isBlocked
                        ? 'border-amber-500/40 bg-amber-500/20 text-amber-400'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{tab.name}</h3>
                    <p className="text-[11px] font-mono text-zinc-500">{tab.route}</p>
                  </div>
                </div>

                {/* Current Notice Card */}
                <div className="mt-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-xs">
                  <p className="font-bold text-zinc-200 truncate flex items-center gap-1.5">
                    <span className="text-amber-400">Notice:</span> {tab.title}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {tab.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleQuickToggle(tab)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    tab.isBlocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                  }`}
                >
                  {tab.isBlocked ? 'Make Tab Live 🟢' : 'Lock Tab 🔒'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(tab)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: EDIT TAB MAINTENANCE & ICON
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedTab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedTab(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase">
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Configure Tab Maintenance</span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
                  {selectedTab.name}
                </h2>
                <p className="text-xs text-zinc-400">
                  Target Route: <span className="font-mono text-orange-300">{selectedTab.route}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTab(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-5 space-y-5">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Maintenance Lock Status</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editForm.isBlocked
                      ? 'Users are currently blocked with blurred background and notice.'
                      : 'Users can access and use this tab normally.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm((prev) => ({ ...prev, isBlocked: !prev.isBlocked }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editForm.isBlocked ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editForm.isBlocked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Choose Notice Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {AVAILABLE_ICONS.map((iconItem) => {
                    const Icon = iconItem.icon;
                    const isSelected = editForm.icon === iconItem.id;
                    return (
                      <button
                        key={iconItem.id}
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, icon: iconItem.id }))}
                        className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/20 text-orange-400 scale-105 shadow-md shadow-orange-500/20'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                        title={iconItem.label}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-[9px] font-semibold truncate w-full text-center">
                          {iconItem.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-orange-500 hover:text-white transition-colors"
                    >
                      ⚡ {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice Heading */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Notice Heading / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Issue Reporting Under Maintenance"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Notice Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Notice Description / Explanation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Explain why this feature is paused and when it will be back..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>

              {/* Live Preview Window */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> User Side Live Preview
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Simulated Screen</span>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-slate-950/80 p-5 text-center text-white">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <SelectedIconComp className="h-8 w-8" />
                    </div>
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Temporarily Paused
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {editForm.title || 'Feature Title'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 max-w-sm">
                      {editForm.description || 'Feature description will appear here.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedTab(null)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Broadcast Settings</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
