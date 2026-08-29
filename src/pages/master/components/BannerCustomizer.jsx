import React, { useState } from 'react';
import {
  Image,
  Upload,
  Link2,
  Sparkles,
  RotateCcw,
  Check,
  Home,
  QrCode,
  UtensilsCrossed,
  TriangleAlert,
  Clock,
  User,
} from 'lucide-react';

import homeDefaultBanner from '../../../assets/banners/pass-banner.jpg';
import passDefaultBanner from '../../../assets/banners/pass-banner.jpg';
import servicesDefaultBanner from '../../../assets/banners/services-banner.jpg';
import reportsDefaultBanner from '../../../assets/banners/reports-banner.jpg';
import visitsDefaultBanner from '../../../assets/banners/visits-banner.jpg';
import profileDefaultBanner from '../../../assets/banners/profile-banner.jpg';

// Curated High-Quality Beach Wallpapers (Unsplash direct high-res CDN)
const CURATED_BEACH_GALLERY = [
  {
    id: 'sunset-drive',
    title: 'Sunset Drive-In',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'coastal-waves',
    title: 'Azure Coastline',
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tropical-palms',
    title: 'Palm Shadows',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'golden-horizon',
    title: 'Golden Waves',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'emerald-lagoon',
    title: 'Emerald Bay',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'dramatic-dusk',
    title: 'Twilight Sand',
    url: 'https://images.unsplash.com/photo-1471922694855-fa598b20955a?auto=format&fit=crop&w=1200&q=80',
  },
];

const TABS_CONFIG = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    title: 'Official Beach Pass',
    badge: 'Muzhappilangad Beach',
    defaultImg: homeDefaultBanner,
  },
  {
    id: 'pass',
    label: 'My Pass',
    icon: QrCode,
    title: 'Resident QR Turnstile',
    badge: 'Digital Clearance',
    defaultImg: passDefaultBanner,
  },
  {
    id: 'services',
    label: 'Services',
    icon: UtensilsCrossed,
    title: 'Direct Beach Services',
    badge: 'Local Directory',
    defaultImg: servicesDefaultBanner,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: TriangleAlert,
    title: 'Community Hazard Reports',
    badge: 'Safety & Quality',
    defaultImg: reportsDefaultBanner,
  },
  {
    id: 'visits',
    label: 'Visits / Profile',
    icon: Clock,
    title: 'Beach Visit History',
    badge: 'Access Log',
    defaultImg: visitsDefaultBanner,
  },
];

export default function BannerCustomizer({ themeSettings, onChangeTheme }) {
  const [selectedTabId, setSelectedTabId] = useState('home');
  const [urlInput, setUrlInput] = useState('');
  const [copiedMsg, setCopiedMsg] = useState('');

  const currentTab = TABS_CONFIG.find((t) => t.id === selectedTabId) || TABS_CONFIG[0];
  const banners = themeSettings?.banners || {};
  const currentBannerUrl = banners[selectedTabId] || currentTab.defaultImg;
  const isCustom = Boolean(banners[selectedTabId]);

  const handleApplyUrl = (urlToApply) => {
    const finalUrl = urlToApply || urlInput;
    if (!finalUrl.trim()) return;
    const updatedBanners = {
      ...banners,
      [selectedTabId]: finalUrl.trim(),
    };
    onChangeTheme({
      ...themeSettings,
      banners: updatedBanners,
    });
    setUrlInput('');
    setCopiedMsg('Banner applied successfully!');
    setTimeout(() => setCopiedMsg(''), 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (typeof base64Url === 'string') {
        handleApplyUrl(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetBanner = () => {
    const updatedBanners = { ...banners };
    delete updatedBanners[selectedTabId];
    onChangeTheme({
      ...themeSettings,
      banners: updatedBanners,
    });
    setCopiedMsg('Reset to default banner');
    setTimeout(() => setCopiedMsg(''), 2500);
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xl space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Image className="h-4.5 w-4.5 text-sky-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Tab Banner Images & Hero Backgrounds</h3>
            <p className="text-[11px] text-zinc-400">
              Customize background photos for each of the 5 user app sections.
            </p>
          </div>
        </div>
        {copiedMsg && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 animate-in fade-in">
            <Check className="h-3.5 w-3.5" />
            {copiedMsg}
          </span>
        )}
      </div>

      {/* Tab Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTabId === tab.id;
          const hasCustom = Boolean(banners[tab.id]);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTabId(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'border border-sky-500 bg-sky-500/15 text-sky-300 shadow-md ring-2 ring-sky-500/20'
                  : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {hasCustom && (
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-xs" title="Custom banner set" />
              )}
            </button>
          );
        })}
      </div>

      {/* Live Preview Card of the Selected Tab's Banner */}
      <div className="relative min-h-[140px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-lg border border-zinc-800 flex flex-col justify-end p-4">
        <img
          src={currentBannerUrl}
          alt={currentTab.label}
          className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/40" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>{currentTab.badge}</span>
          </div>
          <h4 className="text-sm font-extrabold text-white leading-tight">
            {currentTab.title}
          </h4>
          <p className="text-[10px] text-slate-300">
            Preview for <strong className="text-white">{currentTab.label}</strong> tab
          </p>
        </div>

        {isCustom && (
          <button
            type="button"
            onClick={handleResetBanner}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-zinc-300 hover:text-white border border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset to Default</span>
          </button>
        )}
      </div>

      {/* Upload or Enter URL Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Upload Custom Image File */}
        <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 transition-colors cursor-pointer group">
          <Upload className="h-5 w-5 text-zinc-400 group-hover:text-sky-400 mb-1 transition-colors" />
          <p className="text-xs font-bold text-white">Upload New Photo</p>
          <p className="text-[10px] text-zinc-400">PNG, JPG, WEBP up to 5MB</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Enter Custom URL */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
            <Link2 className="h-3.5 w-3.5 text-sky-400" />
            <span>Paste Direct Image URL</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://.../beach.jpg"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={() => handleApplyUrl()}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Preset Curated Beach Gallery */}
      <div className="space-y-2.5 pt-2 border-t border-zinc-800">
        <p className="text-xs font-bold text-zinc-300">
          Or pick from Curated Coastal Banners:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {CURATED_BEACH_GALLERY.map((item) => {
            const isCurrent = currentBannerUrl === item.url;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleApplyUrl(item.url)}
                className={`relative h-20 rounded-xl overflow-hidden border transition-all text-left group cursor-pointer ${
                  isCurrent
                    ? 'border-sky-400 ring-2 ring-sky-500/50 shadow-md'
                    : 'border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-1.5">
                  <p className="text-[10px] font-bold text-white leading-tight truncate">{item.title}</p>
                </div>
                {isCurrent && (
                  <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-sky-500 flex items-center justify-center shadow-xs">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
