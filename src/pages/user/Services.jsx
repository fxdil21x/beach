import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  Hotel,
  Utensils,
  Search,
  PhoneCall,
  X,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Flame,
  Leaf,
  Loader2,
  Star,
  ShieldCheck,
} from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import BeachBanner from '../../components/common/BeachBanner.jsx';
import TabMaintenanceOverlay from '../../components/common/TabMaintenanceOverlay.jsx';
import { ServicesSkeleton } from '../../components/ui/Skeleton.jsx';
import { userNav } from '../../config/navigation.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEmergency } from '../../context/EmergencyContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';
import * as serviceApi from '../../api/serviceApi.js';
import servicesBannerImg from '../../assets/banners/services-banner.jpg';

export default function Services() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { socket } = useEmergency();
  const { featureSettings } = useFeatureSettings() || {};
  const appearance = featureSettings?.appearance || {};
  const accentColor = appearance.accentColor || '#0284C7';
  const accentSec = appearance.accentSecondary || '#38BDF8';
  const glowColor = appearance.glowColor || 'rgba(2, 132, 199, 0.35)';
  const cardsComp = Array.isArray(appearance.components) ? appearance.components.find((c) => c.id === 'cards') : null;
  const cardRadius = appearance.cardRadius || cardsComp?.style || 'rounded-2xl';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Live dynamic backend services
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Modals
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // Restaurant food menu modal
  const [selectedResort, setSelectedResort] = useState(null); // Resort detail modal
  const [selectedFoodCategory, setSelectedFoodCategory] = useState('ALL');

  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  const isModalOpen = Boolean(selectedRestaurant || selectedResort);

  useEffect(() => {
    if (!isModalOpen) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const deviceLayer = window.__deviceModalLayer;
    setPortalTarget(deviceLayer || document.body);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      resolvedRef.current = false;
      setPortalTarget(null);
    }
  }, [isModalOpen]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Load real services from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await serviceApi.getServices({ status: 'active' });
        if (isMounted && res && res.data) {
          setServices(res.data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'transport', label: 'Auto & Taxi' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'stay', label: 'Resorts & Stays' },
  ];

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  // Filter services by category and search
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.transportDetails?.driverName?.toLowerCase().includes(q) ||
        item.transportDetails?.vehicleNumber?.toLowerCase().includes(q) ||
        item.restaurantDetails?.cuisineTypes?.some((c) => c.toLowerCase().includes(q)) ||
        item.restaurantDetails?.menuItems?.some((m) => m.name.toLowerCase().includes(q))
      );
    });
  }, [services, selectedCategory, searchQuery]);

  // Food items of selected restaurant
  const currentDishes = selectedRestaurant?.restaurantDetails?.menuItems || [];
  const filteredDishes = useMemo(() => {
    if (selectedFoodCategory === 'ALL') return currentDishes;
    return currentDishes.filter((d) => d.category === selectedFoodCategory);
  }, [currentDishes, selectedFoodCategory]);

  // Direct call handler: notifies socket.io server and navigates user to normal phone call
  const handleMakeCall = (itemOrPhone, e) => {
    if (e) {
      e.stopPropagation();
    }
    const phone = typeof itemOrPhone === 'object' ? itemOrPhone?.phone : itemOrPhone;
    if (!phone) return;
    const cleanPhone = String(phone).replace(/[^\d+]/g, '');
    if (!cleanPhone) return;

    // 1. Emit socket.io event
    try {
      if (socket && socket.connected) {
        const item = typeof itemOrPhone === 'object' ? itemOrPhone : null;
        socket.emit('service:call-click', {
          serviceId: item?._id,
          serviceName: item?.name,
          category: item?.category,
          phone: cleanPhone,
          driverName: item?.transportDetails?.driverName,
          vehicleNumber: item?.transportDetails?.vehicleNumber,
          userId: user?.id || user?._id || 'ANONYMOUS',
          userName: user?.name || user?.phone || 'Visitor',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('[Socket] Call click event emit error:', err);
    }

    // 2. Navigate user to normal phone call
    window.location.href = `tel:${cleanPhone}`;
  };

  return (
    <div className="relative flex h-screen h-[100dvh] flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <TabMaintenanceOverlay tabId="services" fallbackTitle="Services & Rides Under Maintenance" />
      <MobileHeader title={t('nav.services', 'Services')} showLanguage />

      <main className="relative flex-1 min-h-0 overflow-y-auto px-3.5 py-4 sm:px-5 pb-28">

        {/* Banner */}
        <BeachBanner
          tabId="services"
          badge="Muzhappilangad Beach Directory"
          title="Direct Beach Services & Rides"
          subtitle="Contact verified auto drivers, explore restaurants & live menus, and find beachfront stays."
          image={servicesBannerImg}
        />

        {/* Search Input */}
        <div className="relative mb-3.5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search auto, driver, restaurant, food..."
            className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-4 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`shrink-0 ${cardRadius} px-3.5 py-1.5 text-xs font-semibold transition-all select-none ${
                selectedCategory === cat.id
                  ? 'text-white font-bold'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.id ? accentColor : undefined,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── 2-COLUMN GRID OF SERVICES ADDED BY MASTER ADMIN ── */}
        {loading ? (
          <ServicesSkeleton count={4} />
        ) : filteredServices.length === 0 ? (
          <div className="my-8 rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-400 dark:text-slate-500" />
            <p className="mt-2 text-xs font-bold text-gray-700 dark:text-slate-200">No listings found</p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400">
              {searchQuery
                ? 'Try adjusting your search keywords.'
                : 'No services have been added in this category by Master Admin yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-6">
            {filteredServices.map((item) => {
              /* ─────────────── CARD A: AUTO / TAXI DRIVER CARD ─────────────── */
              if (item.category === 'transport') {
                return (
                  <div
                    key={item._id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Top: Auto Photo / Avatar */}
                      <div className="relative mb-2.5 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/80 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700/80">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">🛺</span>
                        )}
                        <span className="absolute top-1.5 right-1.5 rounded-md bg-white/95 dark:bg-slate-900/95 px-1.5 py-0.5 text-[9px] font-bold text-gray-700 dark:text-slate-300 shadow-xs border border-gray-200 dark:border-slate-700 capitalize">
                          {item.transportDetails?.vehicleType?.replace('_', ' ') || 'Auto'}
                        </span>
                      </div>

                      {/* Driver Name & Reg No */}
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                        {item.transportDetails?.driverName || item.name}
                      </h3>

                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-extrabold uppercase border"
                          style={{
                            backgroundColor: `${accentColor}12`,
                            color: accentColor,
                            borderColor: `${accentColor}30`,
                          }}
                        >
                          {item.transportDetails?.vehicleNumber || 'KL-13-AUTO'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Live
                        </span>
                      </div>

                      {/* Stand Location */}
                      <p className="mt-1.5 text-[10px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{item.transportDetails?.standLocation || item.location}</span>
                      </p>
                    </div>

                    {/* Direct Call Button */}
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <a
                        href={`tel:${String(item.phone || '').replace(/[^\d+]/g, '')}`}
                        onClick={(e) => handleMakeCall(item, e)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                        style={{
                          backgroundColor: accentColor,
                          boxShadow: `0 4px 14px ${glowColor}`,
                        }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{item.phone}</span>
                      </a>
                    </div>
                  </div>
                );
              }

              /* ─────────────── CARD B: RESTAURANT CARD ─────────────── */
              if (item.category === 'restaurant') {
                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelectedRestaurant(item);
                      setSelectedFoodCategory('ALL');
                    }}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
                  >
                    <div>
                      {/* Restaurant Cover */}
                      <div
                        className="relative mb-2.5 overflow-hidden rounded-xl aspect-video flex items-center justify-center border"
                        style={{
                          backgroundColor: `${accentColor}10`,
                          borderColor: `${accentColor}25`,
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Utensils className="h-7 w-7" style={{ color: accentColor }} />
                        )}
                        {item.restaurantDetails?.dietaryType === 'veg' || item.restaurantDetails?.isPureVeg ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                            Veg
                          </span>
                        ) : item.restaurantDetails?.dietaryType === 'seafood' ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-cyan-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs flex items-center gap-0.5">
                            🦐 Seafood
                          </span>
                        ) : item.restaurantDetails?.dietaryType === 'fried' ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs flex items-center gap-0.5">
                            🍟 Fried & Snacks
                          </span>
                        ) : item.restaurantDetails?.dietaryType === 'non-veg' ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                            Non-Veg
                          </span>
                        ) : null}
                        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {item.restaurantDetails?.menuItems?.length || 0} Foods
                        </span>
                      </div>

                      {/* Name & Cuisines */}
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity truncate">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-[10.5px] text-gray-500 dark:text-slate-400 truncate">
                        {item.restaurantDetails?.cuisineTypes?.join(', ') || 'Malabar, Seafood'}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400 dark:text-slate-500 truncate flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{item.restaurantDetails?.openingHours || '11 AM - 11 PM'}</span>
                      </p>
                    </div>

                    {/* View Menu Action */}
                    <div
                      className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold"
                      style={{ color: accentColor }}
                    >
                      <span>View Food Menu</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                );
              }

              /* ─────────────── CARD C: RESORT / STAY CARD ─────────────── */
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedResort(item)}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
                >
                  <div>
                    {/* Cover */}
                    <div className="relative mb-2.5 overflow-hidden rounded-xl bg-purple-50 dark:bg-purple-950/40 aspect-video flex items-center justify-center border border-purple-100 dark:border-purple-900/60">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Hotel className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                      )}
                      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-300">
                        ₹{item.stayDetails?.pricePerNight || 2500}/nt
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-[10.5px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  </div>

                  {/* Direct Call */}
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span>View Details</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 1: RESTAURANT AVAILABLE FOOD MENU MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedRestaurant && portalTarget && createPortal(
        <div
          className="absolute inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          style={{
            background: 'rgba(2, 6, 23, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => setSelectedRestaurant(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl transition-all max-h-[92%] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                {selectedRestaurant.image ? (
                  <img
                    src={selectedRestaurant.image}
                    alt={selectedRestaurant.name}
                    className="h-12 w-12 rounded-2xl object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                    <Utensils className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate flex items-center gap-1.5">
                    <span>{selectedRestaurant.name}</span>
                    {selectedRestaurant.restaurantDetails?.dietaryType === 'veg' || selectedRestaurant.restaurantDetails?.isPureVeg ? (
                      <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.2 text-[9.5px] font-bold text-green-700">
                        <Leaf className="h-2.5 w-2.5" /> Veg
                      </span>
                    ) : selectedRestaurant.restaurantDetails?.dietaryType === 'seafood' ? (
                      <span className="inline-flex items-center gap-0.5 rounded bg-cyan-100 px-1.5 py-0.2 text-[9.5px] font-bold text-cyan-700">
                        🦐 Seafood
                      </span>
                    ) : selectedRestaurant.restaurantDetails?.dietaryType === 'fried' ? (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.2 text-[9.5px] font-bold text-amber-700">
                        🍟 Fried & Snacks
                      </span>
                    ) : selectedRestaurant.restaurantDetails?.dietaryType === 'non-veg' ? (
                      <span className="inline-flex items-center gap-0.5 rounded bg-rose-100 px-1.5 py-0.2 text-[9.5px] font-bold text-rose-700">
                        🔴 Non-Veg
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedRestaurant.location}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Call & Hours Banner */}
            <div
              className="my-3 flex items-center justify-between rounded-2xl border p-3 text-xs"
              style={{
                backgroundColor: `${accentColor}0D`,
                borderColor: `${accentColor}25`,
              }}
            >
              <div>
                <p className="font-bold flex items-center gap-1" style={{ color: accentColor }}>
                  <Clock className="h-3.5 w-3.5" />
                  {selectedRestaurant.restaurantDetails?.openingHours || '11:00 AM - 11:00 PM'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">Call to order food or table reservation</p>
              </div>
              <a
                href={`tel:${String(selectedRestaurant.phone || '').replace(/[^\d+]/g, '')}`}
                onClick={(e) => handleMakeCall(selectedRestaurant, e)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-colors shrink-0 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Now</span>
              </a>
            </div>

            {/* Food Menu Category Tabs */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" style={{ color: accentColor }} /> Available Foods Menu
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {currentDishes.length} Dishes
                </span>
              </div>

              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'Seafood Specials', 'Main Course', 'Starters', 'Breads & Rice', 'Snacks & Quick Bites', 'Desserts', 'Beverages'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFoodCategory(cat)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      selectedFoodCategory === cat
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedFoodCategory === cat ? accentColor : undefined,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Dishes List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[280px] pr-1">
              {filteredDishes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                  No food dishes listed under this category yet.
                </div>
              ) : (
                filteredDishes.map((dish) => (
                  <div
                    key={dish._id}
                    className={`flex items-center justify-between gap-2.5 rounded-2xl border p-2.5 transition-all ${
                      dish.isAvailable
                        ? 'border-gray-100 bg-gray-50/70 hover:bg-white hover:shadow-sm'
                        : 'border-gray-100 bg-gray-100/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[9px] ${
                          dish.type === 'veg'
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : dish.type === 'seafood'
                            ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
                            : 'border-rose-600 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {dish.type === 'veg' ? '●' : dish.type === 'seafood' ? '🦐' : '▲'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{dish.name}</h4>
                          {dish.isSpecial && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 shrink-0">
                              <Sparkles className="h-2 w-2" /> Special
                            </span>
                          )}
                        </div>
                        {dish.description && (
                          <p className="text-[10px] text-gray-500 line-clamp-1">{dish.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-gray-900">₹{dish.price}</span>

                      {dish.isAvailable ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[9.5px] font-bold text-rose-700">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Call to Order */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href={`tel:${String(selectedRestaurant.phone || '').replace(/[^\d+]/g, '')}`}
                onClick={(e) => handleMakeCall(selectedRestaurant, e)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition-colors cursor-pointer"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 14px ${glowColor}`,
                }}
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call to Order ({selectedRestaurant.phone})</span>
              </a>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 2: RESORT / STAY DETAIL MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedResort && portalTarget && createPortal(
        <div
          className="absolute inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          style={{
            background: 'rgba(2, 6, 23, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => setSelectedResort(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl transition-all max-h-[90%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                  <Hotel className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selectedResort.name}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{selectedResort.location}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResort(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Tariff */}
              <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3">
                <span className="text-xs text-purple-900 font-medium">Estimated Tariff</span>
                <span className="text-base font-extrabold text-purple-700">
                  ₹{selectedResort.stayDetails?.pricePerNight || 2500} / night
                </span>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedResort.stayDetails?.amenities || ['Beach View', 'AC Rooms', 'Wi-Fi', 'Free Parking']).map((amenity, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Reception */}
              <div className="pt-2 border-t border-gray-100">
                <a
                  href={`tel:${String(selectedResort.phone || '').replace(/[^\d+]/g, '')}`}
                  onClick={(e) => handleMakeCall(selectedResort, e)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call Reception ({selectedResort.phone})</span>
                </a>
              </div>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      <BottomNavigation items={userNav} />
    </div>
  );
}
