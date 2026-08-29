import {
  Sparkles,
  QrCode,
  Home,
  ClipboardList,
  LayoutGrid,
  TriangleAlert,
  UserRound,
  ScanLine,
  Search,
  Clock3,
  Globe,
  Bell,
  CheckCircle,
  Phone,
  Flame,
  Wifi,
  Battery,
  Footprints,
  Camera,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

import defaultBeachImage from '../../public/image/Gemini_Generated_Image_kxdt3pkxdt3pkxdt.png';
import residentPhotoMen from '../../public/image/men.jpg';
import residentPhotoWomen from '../../public/image/women.jpg';
import servicesBanner from '../../../assets/banners/services-banner.jpg';
import reportsBanner from '../../../assets/banners/reports-banner.jpg';
import visitsBanner from '../../../assets/banners/visits-banner.jpg';
import passBanner from '../../../assets/banners/pass-banner.jpg';
import profileBanner from '../../../assets/banners/profile-banner.jpg';

export default function IphoneScreenMockup({
  activeTab = 'user',
  activeScreen = 'user-home',
  themeSettings,
}) {
  const isLight = themeSettings.themeMode === 'light';
  const accent = themeSettings.accentColor || '#0284C7';
  const accentSec = themeSettings.accentSecondary || '#38BDF8';
  const components = Array.isArray(themeSettings.components) ? themeSettings.components : [];
  const navComp = components.find((c) => c.id === 'nav');
  const cardsComp = components.find((c) => c.id === 'cards');

  const dockStyle =
    activeTab === 'admin'
      ? themeSettings.adminDockStyle || 'flush'
      : themeSettings.userDockStyle || themeSettings.dockStyle || navComp?.style || 'floating';
  const rawCardRadius = themeSettings.cardRadius || cardsComp?.style || 'rounded-2xl';

  // Dynamic Theme Colors based directly on isLight mode
  const bg = isLight ? '#F8FAFC' : (themeSettings.bgColor || '#090A0F');
  const cardBg = isLight ? '#FFFFFF' : (themeSettings.cardBgColor || '#121214');
  const textPrimary = isLight ? 'text-slate-900' : 'text-zinc-100';
  const textSecondary = isLight ? 'text-slate-500' : 'text-zinc-400';
  const borderColor = isLight ? 'border-slate-200/90' : 'border-zinc-800/90';
  const innerBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/80 border-zinc-800';
  const glow = themeSettings.glowColor || 'rgba(2, 132, 199, 0.35)';

  // Exact Card Radius Mapping
  const cardRadius = rawCardRadius === 'rounded-3xl'
    ? 'rounded-3xl'
    : rawCardRadius === 'rounded-xl'
    ? 'rounded-xl'
    : 'rounded-2xl';

  const btnRadius = rawCardRadius === 'rounded-3xl'
    ? 'rounded-2xl'
    : rawCardRadius === 'rounded-xl'
    ? 'rounded-md'
    : 'rounded-xl';

  return (
    <div className="flex flex-col items-center">
      {/* iPhone 16 Pro Hardware Chassis */}
      <div className="relative mx-auto w-full max-w-[350px] select-none">
        <div className="relative overflow-hidden rounded-[52px] border-[10px] border-zinc-900 bg-zinc-950 p-2.5 shadow-2xl shadow-black/80 ring-1 ring-white/15">
          {/* Hardware Side Buttons */}
          <div className="absolute -left-[14px] top-24 h-8 w-[4px] rounded-l bg-zinc-700" />
          <div className="absolute -left-[14px] top-36 h-12 w-[4px] rounded-l bg-zinc-700" />
          <div className="absolute -left-[14px] top-52 h-12 w-[4px] rounded-l bg-zinc-700" />
          <div className="absolute -right-[14px] top-32 h-16 w-[4px] rounded-r bg-zinc-700" />

          {/* Screen Viewport */}
          <div
            className={`relative flex h-[650px] flex-col overflow-hidden rounded-[42px] transition-colors duration-300 ${!isLight ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}
            style={{ backgroundColor: bg }}
          >
            {/* Top iOS Status Bar & Dynamic Island */}
            <div
              className={`relative z-30 flex items-center justify-between px-6 pt-3 text-[11px] font-semibold transition-colors duration-300 ${
                isLight ? 'bg-white/95 text-slate-800' : 'bg-slate-950 text-zinc-200'
              }`}
            >
              <span>9:41</span>
              {/* Dynamic Island */}
              <div className="flex h-5 w-24 items-center justify-between rounded-full bg-black px-2 ring-1 ring-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3" />
                <Battery className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Mobile Header (Strictly Dynamic Light / Dark) */}
            <div
              className={`relative z-20 flex items-center justify-between border-b px-3.5 py-2 backdrop-blur-md shadow-2xs transition-colors duration-300 ${
                isLight
                  ? 'border-slate-200/90 bg-white/95 text-slate-900'
                  : 'border-slate-800/80 bg-slate-900/95 text-white'
              }`}
            >
              <div className="min-w-0 flex-1 text-left">
                <h1 className={`truncate text-xs font-extrabold tracking-tight ${textPrimary}`}>
                  {activeTab === 'user'
                    ? (activeScreen === 'user-home' ? 'Benaulim Beach Pass' : activeScreen === 'user-pass' ? 'My Beach Pass' : activeScreen === 'user-services' ? 'Services & Rides' : activeScreen === 'user-report' ? 'Report Issue' : activeScreen === 'user-visits' ? 'My Visits' : 'Profile')
                    : (activeScreen === 'admin-search' ? 'Resident Search' : activeScreen === 'admin-dashboard' ? 'Admin Dashboard' : activeScreen === 'admin-recent' ? 'Recent Entries' : 'Beach Reports')}
                </h1>
                <p className={`truncate text-[9px] font-medium ${textSecondary}`}>
                  Official Beach Access System
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span
                  className={`flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <Globe className="h-2.5 w-2.5 text-slate-400" /> EN ▾
                </span>
                <div
                  className={`relative flex h-6 w-6 items-center justify-center rounded-lg border ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <Bell className="h-3 w-3" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                </div>
              </div>
            </div>

            {/* Screen Content Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 scrollbar-none">
              {/* USER APP SCREENS */}
              {activeScreen === 'user-home' && (
                <ActualUserHomeScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                  banners={themeSettings?.banners}
                />
              )}

              {activeScreen === 'user-pass' && (
                <ActualUserPassScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                  banners={themeSettings?.banners}
                />
              )}

              {activeScreen === 'user-services' && (
                <ActualUserServicesScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                  banners={themeSettings?.banners}
                />
              )}

              {activeScreen === 'user-report' && (
                <ActualUserReportScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                  banners={themeSettings?.banners}
                />
              )}

              {activeScreen === 'user-visits' && (
                <ActualUserVisitsScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                  banners={themeSettings?.banners}
                />
              )}

              {activeScreen === 'user-profile' && (
                <ActualUserProfileScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                  banners={themeSettings?.banners}
                />
              )}

              {/* ADMIN PORTAL SCREENS */}
              {activeScreen === 'admin-search' && (
                <ActualAdminSearchScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                />
              )}

              {activeScreen === 'admin-dashboard' && (
                <ActualAdminDashboardScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                />
              )}

              {activeScreen === 'admin-recent' && (
                <ActualAdminRecentScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                />
              )}

              {activeScreen === 'admin-reports' && (
                <ActualAdminReportsScreen
                  isLight={isLight}
                  accent={accent}
                  cardBg={cardBg}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  innerBg={innerBg}
                  cardRadius={cardRadius}
                />
              )}
            </div>

            {/* Actual FloatingDock vs Solid Bottom Navigation Container */}
            <div className={`absolute bottom-0 inset-x-0 z-40 flex flex-col items-center ${dockStyle === 'floating' ? 'px-3 pb-3 pointer-events-none' : 'pointer-events-auto'}`}>
              {/* Admin Floating Action Buttons (FABs) when on Admin screens and Floating Dock is active */}
              {activeTab === 'admin' && dockStyle === 'floating' && (
                <div className="w-full flex justify-end gap-2 mb-2 pr-1 pointer-events-auto">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-lg ring-2 ring-white/20 cursor-pointer hover:scale-105 transition-transform">
                    <Search className="h-4 w-4 stroke-[2.4]" />
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/20 cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: accent }}
                  >
                    <ScanLine className="h-5 w-5 stroke-[2.4]" />
                  </div>
                </div>
              )}

              {/* Dynamic Bottom Navigation Style */}
              {dockStyle === 'floating' ? (
                /* Floating Dock Capsule */
                <div
                  className="w-full max-w-[280px] flex items-center justify-around rounded-full bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800/90 px-2 py-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.35)] pointer-events-auto select-none transition-all duration-300"
                >
                  {activeTab === 'user' ? (
                    <>
                      {[
                        { icon: Home, label: 'Home', screenId: 'user-home' },
                        { icon: ClipboardList, label: 'Visits', screenId: 'user-visits' },
                        { icon: LayoutGrid, label: 'Services', screenId: 'user-services' },
                        { icon: TriangleAlert, label: 'Report', screenId: 'user-report' },
                        { icon: UserRound, label: 'Profile', screenId: 'user-profile' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeScreen === item.screenId;
                        return (
                          <div
                            key={item.label}
                            className="relative flex-1 flex flex-col items-center justify-center py-0.5"
                          >
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
                              {isActive && (
                                <div
                                  className="absolute inset-0 rounded-full shadow-sm ring-1.5"
                                  style={{
                                    backgroundColor: `${accent}25`,
                                    borderColor: `${accent}60`,
                                  }}
                                />
                              )}

                              <Icon
                                className="h-4 w-4 relative z-10 transition-transform"
                                style={{
                                  color: isActive ? accent : '#A3A3A3',
                                  strokeWidth: isActive ? 2.4 : 1.9,
                                }}
                              />

                              {isActive && (
                                <span
                                  className="absolute -bottom-0.5 h-1 w-1 rounded-full z-10"
                                  style={{ backgroundColor: accent }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {[
                        { icon: ScanLine, label: 'Scan', screenId: 'admin-scan' },
                        { icon: Search, label: 'Search', screenId: 'admin-search' },
                        { icon: Clock3, label: 'Recent', screenId: 'admin-recent' },
                        { icon: TriangleAlert, label: 'Reports', screenId: 'admin-reports' },
                        { icon: UserRound, label: 'Profile', screenId: 'admin-profile' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeScreen === item.screenId;
                        return (
                          <div
                            key={item.label}
                            className="relative flex-1 flex flex-col items-center justify-center py-0.5"
                          >
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full">
                              {isActive && (
                                <div
                                  className="absolute inset-0 rounded-full shadow-sm ring-1.5"
                                  style={{
                                    backgroundColor: `${accent}25`,
                                    borderColor: `${accent}60`,
                                  }}
                                />
                              )}

                              <Icon
                                className="h-4 w-4 relative z-10 transition-transform"
                                style={{
                                  color: isActive ? accent : '#A3A3A3',
                                  strokeWidth: isActive ? 2.4 : 1.9,
                                }}
                              />

                              {isActive && (
                                <span
                                  className="absolute -bottom-0.5 h-1 w-1 rounded-full z-10"
                                  style={{ backgroundColor: accent }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              ) : (
                /* Solid Full-Width Bottom Bar */
                <div
                  className={`w-full flex items-center justify-around border-t py-2 px-3 backdrop-blur-md transition-all duration-300 ${
                    isLight
                      ? 'border-slate-200/90 bg-white/95 text-slate-700'
                      : 'border-zinc-800/90 bg-zinc-950/95 text-zinc-300'
                  }`}
                >
                  {activeTab === 'user' ? (
                    <>
                      {[
                        { icon: Home, label: 'Home', screenId: 'user-home' },
                        { icon: ClipboardList, label: 'Visits', screenId: 'user-visits' },
                        { icon: LayoutGrid, label: 'Services', screenId: 'user-services' },
                        { icon: TriangleAlert, label: 'Report', screenId: 'user-report' },
                        { icon: UserRound, label: 'Profile', screenId: 'user-profile' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeScreen === item.screenId;
                        return (
                          <div
                            key={item.label}
                            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer py-1"
                          >
                            <Icon
                              className="h-4 w-4 transition-colors"
                              style={{
                                color: isActive ? accent : isLight ? '#64748B' : '#71717A',
                                strokeWidth: isActive ? 2.4 : 1.8,
                              }}
                            />
                            <span
                              className="text-[9px] font-semibold transition-colors"
                              style={{
                                color: isActive ? accent : isLight ? '#64748B' : '#71717A',
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {[
                        { icon: ScanLine, label: 'Scan', screenId: 'admin-scan' },
                        { icon: Search, label: 'Search', screenId: 'admin-search' },
                        { icon: Clock3, label: 'Recent', screenId: 'admin-recent' },
                        { icon: TriangleAlert, label: 'Reports', screenId: 'admin-reports' },
                        { icon: UserRound, label: 'Profile', screenId: 'admin-profile' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeScreen === item.screenId;
                        return (
                          <div
                            key={item.label}
                            className="flex flex-col items-center justify-center gap-0.5 cursor-pointer py-1"
                          >
                            <Icon
                              className="h-4 w-4 transition-colors"
                              style={{
                                color: isActive ? accent : isLight ? '#64748B' : '#71717A',
                                strokeWidth: isActive ? 2.4 : 1.8,
                              }}
                            />
                            <span
                              className="text-[9px] font-semibold transition-colors"
                              style={{
                                color: isActive ? accent : isLight ? '#64748B' : '#71717A',
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {/* iPhone Home Indicator Bar */}
              <div
                className={`mx-auto mt-2 h-1 w-28 rounded-full transition-colors ${
                  isLight ? 'bg-slate-400/80' : 'bg-white/30'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ACTUAL USER APP SCREENS (With Dynamic Light & Dark Color Adaptations)
// ----------------------------------------------------------------------

function ActualUserHomeScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, innerBg, cardRadius, banners }) {
  const homeBannerImg = banners?.home || defaultBeachImage;
  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* 1. ACTUAL BeachBanner Component with Photo Background */}
      <div className={`relative min-h-[140px] overflow-hidden ${cardRadius} bg-slate-950 text-white shadow-md border border-slate-800/80 flex flex-col justify-end p-3.5 transition-all duration-200`}>
        <img
          src={homeBannerImg}
          alt="Beach Background"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/30" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Muzhappilangad Beach</span>
          </div>
          <h2 className="text-xs font-extrabold text-white leading-tight">
            Official Beach Access Pass
          </h2>
          <p className="text-[9px] text-slate-200">
            Verified resident free pass & gate QR verification
          </p>
        </div>
      </div>

      {/* 2. ACTUAL Tabs Component (Dynamically Adapting to Light / Dark & Radius) */}
      <div
        className={`flex ${cardRadius} p-1 text-xs font-semibold border transition-all duration-200 ${
          isLight ? 'border-slate-200 bg-slate-200/80' : 'border-zinc-800 bg-zinc-900'
        }`}
      >
        <div
          className={`flex-1 ${cardRadius} py-1.5 text-center text-[10px] text-white shadow-xs font-bold transition-all duration-200`}
          style={{ backgroundColor: accent }}
        >
          Register Pass
        </div>
        <div
          className={`flex-1 ${cardRadius} py-1.5 text-center text-[10px] font-medium transition-all duration-200 ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          Search Resident
        </div>
      </div>

      {/* 3. ACTUAL Resident Search & Verified Pass Card */}
      <div
        className={`${cardRadius} border ${borderColor} p-3 shadow-xs space-y-2.5 transition-all duration-200`}
        style={{ backgroundColor: cardBg }}
      >
        <div
          className={`flex items-center justify-between border-b pb-2 ${
            isLight ? 'border-slate-100' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <img
              src={residentPhotoMen}
              alt="Resident Avatar"
              className={`h-10 w-10 ${cardRadius} object-cover border shadow-xs transition-all duration-200 ${
                isLight ? 'border-slate-200' : 'border-zinc-700'
              }`}
            />
            <div>
              <p className={`text-xs font-bold ${textPrimary}`}>John Doe</p>
              <p className={`text-[10px] ${textSecondary}`}>House #14-B Coastal Way</p>
              <span className="text-[9px] font-semibold text-emerald-500">✓ Verified Pass</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div
            className={`flex h-11 w-11 items-center justify-center ${cardRadius} p-1 border shadow-xs transition-all duration-200 ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-700'
            }`}
          >
            <QrCode className={`h-full w-full ${isLight ? 'text-slate-900' : 'text-white'}`} />
          </div>
        </div>

        <div className={`flex items-center justify-between text-[9px] ${textSecondary}`}>
          <span>Guardian: Robert Doe</span>
          <span className={`font-mono font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            #RES-2026-9481
          </span>
        </div>
      </div>

      {/* 4. ACTUAL Emergency SOS Button (Clean Light & Dark Mode) */}
      <div
        className={`${cardRadius} border p-2.5 flex items-center justify-between transition-all duration-200 ${
          isLight
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-rose-900/60 bg-rose-950/40 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-rose-500" />
          <div>
            <p className={`text-[11px] font-bold ${isLight ? 'text-rose-950' : 'text-rose-100'}`}>
              Emergency Lifeguard SOS
            </p>
            <p className={`text-[9px] ${isLight ? 'text-rose-700' : 'text-rose-300/80'}`}>
              Direct alert to beach safety team
            </p>
          </div>
        </div>
        <span className={`${cardRadius} bg-rose-600 px-2 py-1 text-[9px] font-bold text-white shadow-xs`}>
          SOS
        </span>
      </div>
    </div>
  );
}

function ActualUserPassScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius, banners }) {
  const passBannerImg = banners?.pass || passBanner;
  return (
    <div className="space-y-3 text-center animate-in fade-in duration-150">
      {/* Pass Banner with Real Photo */}
      <div className={`relative min-h-[110px] overflow-hidden ${cardRadius} bg-slate-950 text-white shadow-md flex flex-col justify-end p-3 border border-slate-800 transition-all duration-200`}>
        <img src={passBannerImg} alt="Pass Banner" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="relative z-10 text-left">
          <span className="text-[9px] font-bold text-amber-300 uppercase">OFFICIAL RESIDENT BADGE</span>
          <h3 className="text-xs font-bold text-white">Digital Turnstile QR Pass</h3>
        </div>
      </div>

      {/* Actual QR Pass Card */}
      <div className={`${cardRadius} border ${borderColor} p-4 shadow-xs space-y-3 transition-all duration-200`} style={{ backgroundColor: cardBg }}>
        <div className="flex items-center justify-center gap-2">
          <img
            src={residentPhotoMen}
            alt="Avatar"
            className={`h-8 w-8 rounded-full object-cover border ${
              isLight ? 'border-slate-300' : 'border-zinc-700'
            }`}
          />
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold text-white shadow-xs`}
            style={{ backgroundColor: accent }}
          >
            FREE ENTRY VALID
          </span>
        </div>

        {/* Big Crisp QR Code */}
        <div
          className={`mx-auto flex h-32 w-32 items-center justify-center ${cardRadius} p-2.5 border shadow-inner transition-all duration-200 ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-700'
          }`}
        >
          <QrCode className={`h-full w-full ${isLight ? 'text-slate-900' : 'text-white'}`} />
        </div>

        <div>
          <p className={`text-xs font-bold ${textPrimary}`}>John Doe</p>
          <p className={`text-[10px] ${textSecondary}`}>House 14-B Coastal Way, Benaulim</p>
        </div>
      </div>
    </div>
  );
}

function ActualUserServicesScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius, banners }) {
  const servicesBannerImg = banners?.services || servicesBanner;
  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Services Banner */}
      <div className={`relative min-h-[110px] overflow-hidden ${cardRadius} bg-slate-950 text-white shadow-md flex flex-col justify-end p-3 border border-slate-800 transition-all duration-200`}>
        <img src={servicesBannerImg} alt="Services" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="relative z-10 text-left">
          <span className="text-[9px] font-bold text-amber-300 uppercase">LOCAL DIRECTORY</span>
          <h3 className="text-xs font-bold text-white">Beach Services & Water Sports</h3>
        </div>
      </div>

      {/* Category Filter Pills (matching live theme accent) */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <span
          className={`shrink-0 ${cardRadius} px-2.5 py-1 text-[9px] font-bold text-white shadow-xs transition-all duration-200`}
          style={{ backgroundColor: accent }}
        >
          All Services
        </span>
        <span
          className={`shrink-0 ${cardRadius} border px-2.5 py-1 text-[9px] font-semibold transition-all duration-200 ${
            isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-zinc-800 bg-[#121214] text-zinc-400'
          }`}
        >
          Auto &amp; Taxi
        </span>
        <span
          className={`shrink-0 ${cardRadius} border px-2.5 py-1 text-[9px] font-semibold transition-all duration-200 ${
            isLight ? 'border-slate-200 bg-white text-slate-600' : 'border-zinc-800 bg-[#121214] text-zinc-400'
          }`}
        >
          Restaurants
        </span>
      </div>

      {/* Services Cards List */}
      <div className="space-y-2">
        {[
          { name: 'Sunset Beach Shack', type: 'Seafood & Drinks', price: '₹350 avg', rating: '4.9 ★' },
          { name: 'Lifeguard Auto Taxi', type: 'KL-13-AUTO', price: 'Live Stand', rating: '4.8 ★' },
          { name: 'Beachfront Stays', type: 'Resort & Lounge', price: '₹2,500 / night', rating: '5.0 ★' },
        ].map((item, i) => (
          <div
            key={i}
            className={`${cardRadius} flex items-center justify-between border ${borderColor} p-2.5 shadow-xs transition-all duration-200`}
            style={{ backgroundColor: cardBg }}
          >
            <div>
              <p className={`text-xs font-bold ${textPrimary}`}>{item.name}</p>
              <p className={`text-[9px] ${textSecondary}`}>
                {item.type} • <span className="font-semibold text-emerald-500">{item.price}</span>
              </p>
            </div>
            <span
              className="text-[9.5px] font-bold px-2 py-0.5 rounded-lg text-white"
              style={{ backgroundColor: accent }}
            >
              Contact
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActualUserReportScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius, banners }) {
  const reportsBannerImg = banners?.reports || reportsBanner;
  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Reports Banner */}
      <div className="relative min-h-[110px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md flex flex-col justify-end p-3 border border-slate-800">
        <img src={reportsBannerImg} alt="Reports" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="relative z-10 text-left">
          <span className="text-[9px] font-bold text-rose-300 uppercase">SAFETY & CLEANLINESS</span>
          <h3 className="text-xs font-bold text-white">Report Incident or Damage</h3>
        </div>
      </div>

      <div className={`${cardRadius} border ${borderColor} p-3 space-y-2 shadow-xs`} style={{ backgroundColor: cardBg }}>
        <div
          className={`flex h-16 flex-col items-center justify-center rounded-xl border-2 border-dashed text-[10px] ${
            isLight
              ? 'border-slate-300 bg-slate-50 text-slate-500'
              : 'border-zinc-700 bg-zinc-900/60 text-zinc-400'
          }`}
        >
          <Camera className="h-4 w-4 text-slate-400 mb-0.5" />
          <span>Tap to capture incident photo</span>
        </div>

        <button
          type="button"
          className="w-full rounded-xl py-1.5 text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: accent }}
        >
          Submit Beach Report
        </button>
      </div>
    </div>
  );
}

function ActualUserVisitsScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius, banners }) {
  const visitsBannerImg = banners?.visits || visitsBanner;
  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      {/* Visits Banner */}
      <div className="relative min-h-[110px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md flex flex-col justify-end p-3 border border-slate-800">
        <img src={visitsBannerImg} alt="Visits" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="relative z-10 text-left">
          <span className="text-[9px] font-bold text-emerald-300 uppercase">ACCESS LOG</span>
          <h3 className="text-xs font-bold text-white">My Beach Visits & Check-ins</h3>
        </div>
      </div>

      {[
        { gate: 'Main North Gate', time: 'Today • 10:30 AM', status: 'Approved Free' },
        { gate: 'South Marina Gate', time: 'Yesterday • 05:15 PM', status: 'Approved Free' },
      ].map((v, i) => (
        <div
          key={i}
          className={`${cardRadius} flex items-center justify-between border ${borderColor} p-2.5 shadow-xs`}
          style={{ backgroundColor: cardBg }}
        >
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isLight ? 'bg-emerald-500/15 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              <Footprints className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className={`text-xs font-bold ${textPrimary}`}>{v.gate}</p>
              <p className={`text-[9px] ${textSecondary}`}>{v.time}</p>
            </div>
          </div>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
              isLight ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-950/60 text-emerald-400'
            }`}
          >
            {v.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActualUserProfileScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius, banners }) {
  const profileBannerImg = banners?.profile || profileBanner;
  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Profile Banner */}
      <div className="relative min-h-[110px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md flex flex-col justify-end p-3 border border-slate-800">
        <img src={profileBannerImg} alt="Profile" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="relative z-10 flex items-center gap-2.5">
          <img
            src={residentPhotoMen}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover border-2 border-white/80 shadow-md"
          />
          <div>
            <h3 className="text-xs font-bold text-white">John Doe</h3>
            <p className="text-[9px] text-white/90">+1 (555) 019-2834</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {['House & Household Members', 'Emergency Contacts', 'Beach Safety Guidelines'].map(
          (item, i) => (
            <div
              key={i}
              className={`${cardRadius} flex items-center justify-between border ${borderColor} p-2 text-xs font-medium ${textPrimary} shadow-xs`}
              style={{ backgroundColor: cardBg }}
            >
              <span>{item}</span>
              <span className={isLight ? 'text-slate-400' : 'text-zinc-500'}>›</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// ACTUAL ADMIN APP SCREENS (Pixel Perfect Light & Dark)
// ----------------------------------------------------------------------

function ActualAdminSearchScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius }) {
  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Actual Admin Search Banner */}
      <div
        className={`${cardRadius} p-3.5 text-white shadow-sm`}
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #0369A1 100%)`,
        }}
      >
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm">
          ADMIN VERIFICATION
        </span>
        <h3 className="mt-1 text-xs font-extrabold">Search Resident Records</h3>
        <p className="text-[9px] text-white/90">Verify pass and register free beach check-in</p>
      </div>

      {/* Actual Search Input Box */}
      <div className={`${cardRadius} border ${borderColor} p-2 shadow-xs`} style={{ backgroundColor: cardBg }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value="John Doe"
            className={`w-full rounded-lg border py-1 pl-7 pr-3 text-[10px] font-medium outline-none ${
              isLight
                ? 'border-slate-200 bg-slate-50 text-slate-900'
                : 'border-zinc-700 bg-zinc-900 text-white'
            }`}
            readOnly
          />
        </div>
      </div>

      {/* Actual Resident Verification Result Card with Photo */}
      <div className={`${cardRadius} border ${borderColor} p-3 space-y-2 shadow-xs`} style={{ backgroundColor: cardBg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={residentPhotoMen}
              alt="John Doe"
              className={`h-10 w-10 rounded-xl object-cover border shadow-xs ${
                isLight ? 'border-slate-200' : 'border-zinc-700'
              }`}
            />
            <div>
              <p className={`text-xs font-bold ${textPrimary}`}>John Doe</p>
              <p className={`text-[10px] ${textSecondary}`}>House 14-B Coastal Way</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              isLight
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            }`}
          >
            Pass Active
          </span>
        </div>

        <div
          className={`grid grid-cols-2 gap-1 rounded-lg p-2 text-[9px] ${
            isLight ? 'bg-slate-50 text-slate-600' : 'bg-zinc-900/80 text-zinc-400'
          }`}
        >
          <div>Guardian: Robert Doe</div>
          <div>Phone: +1 555-0192</div>
        </div>

        <button
          type="button"
          className="w-full rounded-xl py-1.5 text-[10px] font-bold text-white shadow-xs"
          style={{ backgroundColor: accent }}
        >
          Check-in Free Entry
        </button>
      </div>
    </div>
  );
}

function ActualAdminDashboardScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius }) {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      <div className="grid grid-cols-2 gap-2">
        <div className={`${cardRadius} border ${borderColor} p-2.5 shadow-xs`} style={{ backgroundColor: cardBg }}>
          <p className={`text-[9px] ${textSecondary}`}>Total Entries Today</p>
          <p className={`text-base font-extrabold ${textPrimary}`}>124</p>
          <span className="text-[9px] font-semibold text-emerald-500">+12% today</span>
        </div>
        <div className={`${cardRadius} border ${borderColor} p-2.5 shadow-xs`} style={{ backgroundColor: cardBg }}>
          <p className={`text-[9px] ${textSecondary}`}>Resident Passes</p>
          <p className={`text-base font-extrabold ${textPrimary}`}>7</p>
          <span className="text-[9px] font-semibold text-emerald-500">100% active</span>
        </div>
      </div>

      <div className={`${cardRadius} border ${borderColor} p-3 shadow-xs`} style={{ backgroundColor: cardBg }}>
        <p className={`text-[10px] font-bold ${textPrimary} mb-2`}>Live Gate Scans Stream</p>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between">
            <span className={textPrimary}>John Doe (Resident)</span>
            <span className="font-bold text-emerald-500">+1 Free Entry</span>
          </div>
          <div className="flex justify-between">
            <span className={textPrimary}>Family Pass (4 guests)</span>
            <span className="font-bold text-sky-500">+4 Visitors</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActualAdminRecentScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius }) {
  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {[
        { name: 'John Doe', type: 'Resident Free', time: '10:30 AM', gate: 'Gate North 1' },
        { name: 'Visitor Group (4)', type: 'Visitor Ticket', time: '09:15 AM', gate: 'Main Public Gate' },
        { name: 'Sarah Connor', type: 'Resident Free', time: '08:45 AM', gate: 'Gate South 2' },
      ].map((item, i) => (
        <div
          key={i}
          className={`${cardRadius} flex items-center justify-between border ${borderColor} p-2.5 shadow-xs`}
          style={{ backgroundColor: cardBg }}
        >
          <div>
            <p className={`text-xs font-bold ${textPrimary}`}>{item.name}</p>
            <p className={`text-[9px] ${textSecondary}`}>{item.gate} • {item.time}</p>
          </div>
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
            style={{ backgroundColor: item.type.includes('Resident') ? accent : '#059669' }}
          >
            {item.type}
          </span>
        </div>
      ))}
    </div>
  );
}

function ActualAdminReportsScreen({ isLight, accent, cardBg, textPrimary, textSecondary, borderColor, cardRadius }) {
  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      <div className={`${cardRadius} border ${borderColor} p-3 space-y-2 shadow-xs`} style={{ backgroundColor: cardBg }}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${textPrimary}`}>Overflowing Bin</span>
          <span
            className={`rounded px-2 py-0.5 text-[9px] font-bold ${
              isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
            }`}
          >
            OPEN
          </span>
        </div>
        <p className={`text-[9px] ${textSecondary}`}>Near lifeguard station 2 walkway</p>
        <button
          type="button"
          className="w-full rounded-lg py-1 text-[10px] font-bold text-white shadow-xs"
          style={{ backgroundColor: accent }}
        >
          Mark Resolved
        </button>
      </div>
    </div>
  );
}
