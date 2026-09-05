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
  Heart,
  ChevronLeft,
  ShoppingBag,
  Plus,
  Minus,
  Navigation,
  Check,
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

const CULINARY_FALLBACKS = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  chicken: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  snack: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
  drink: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
  veg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
};

function getDishImage(dish) {
  if (dish?.image && dish.image.trim()) return dish.image;
  const name = (dish?.name || '').toLowerCase();
  const cat = (dish?.category || '').toLowerCase();
  const type = (dish?.type || '').toLowerCase();

  if (name.includes('burger') || name.includes('sandwich') || name.includes('roll')) return CULINARY_FALLBACKS.burger;
  if (name.includes('fish') || name.includes('meen') || name.includes('prawn') || name.includes('chemmeen') || name.includes('crab') || name.includes('squid') || name.includes('koonthal') || name.includes('kallummakkaya') || name.includes('mussel') || type === 'seafood' || cat.includes('seafood')) return CULINARY_FALLBACKS.seafood;
  if (name.includes('biryani') || name.includes('biriyani') || name.includes('mandi') || name.includes('rice') || cat.includes('breads & rice')) return CULINARY_FALLBACKS.biryani;
  if (name.includes('chicken') || name.includes('beef') || name.includes('mutton') || name.includes('meat') || name.includes('roast') || name.includes('curry')) return CULINARY_FALLBACKS.chicken;
  if (name.includes('banana') || name.includes('pazham') || name.includes('fry') || name.includes('snack') || name.includes('samosa') || cat.includes('snack')) return CULINARY_FALLBACKS.snack;
  if (name.includes('juice') || name.includes('shake') || name.includes('mojito') || name.includes('tea') || name.includes('coffee') || cat.includes('beverage')) return CULINARY_FALLBACKS.drink;
  if (name.includes('ice') || name.includes('cake') || name.includes('sweet') || cat.includes('dessert')) return CULINARY_FALLBACKS.dessert;
  if (type === 'veg') return CULINARY_FALLBACKS.veg;
  return CULINARY_FALLBACKS.default;
}

const FOOD_CATEGORIES = [
  { id: 'ALL', label: 'All', icon: '🍽️' },
  { id: 'Burgers & Snacks', label: 'Burger', icon: '🍔' },
  { id: 'Seafood Specials', label: 'Seafood', icon: '🦐' },
  { id: 'Main Course', label: 'Main Course', icon: '🍛' },
  { id: 'Starters', label: 'Starters', icon: '🥟' },
  { id: 'Breads & Rice', label: 'Rice & Breads', icon: '🍚' },
  { id: 'Snacks & Quick Bites', label: 'Snacks', icon: '🍟' },
  { id: 'Desserts', label: 'Dessert', icon: '🍰' },
  { id: 'Beverages', label: 'Drinks', icon: '🥤' },
];

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

  // Active Modals & Views
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // Restaurant food menu modal
  const [selectedDish, setSelectedDish] = useState(null); // Dedicated food detail modal
  const [dishQuantity, setDishQuantity] = useState(1);
  const [selectedResort, setSelectedResort] = useState(null); // Resort detail modal
  const [selectedFoodCategory, setSelectedFoodCategory] = useState('ALL');

  // Favorites state persisted locally
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('beach_favorite_dishes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (dishId, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(dishId);
      const next = exists ? prev.filter((id) => id !== dishId) : [...prev, dishId];
      try {
        localStorage.setItem('beach_favorite_dishes', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  const isModalOpen = Boolean(selectedRestaurant || selectedResort || selectedDish);

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
    { id: 'restaurant', label: 'Restaurants & Food' },
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
    return currentDishes.filter((d) => {
      if (d.category === selectedFoodCategory) return true;
      if (selectedFoodCategory === 'Burgers & Snacks' && (d.category === 'Snacks & Quick Bites' || d.name?.toLowerCase().includes('burger'))) return true;
      return false;
    });
  }, [currentDishes, selectedFoodCategory]);

  // Recommended dishes excluding current selected dish
  const recommendedDishes = useMemo(() => {
    if (!selectedDish) return [];
    return currentDishes.filter((d) => (d._id || d.name) !== (selectedDish._id || selectedDish.name)).slice(0, 4);
  }, [currentDishes, selectedDish]);

  // Direct call handler: notifies socket.io server and navigates user to normal phone call
  const handleMakeCall = (itemOrPhone, e, callMeta = null) => {
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
          dishName: callMeta?.dishName,
          dishQuantity: callMeta?.quantity,
          dishPrice: callMeta?.totalPrice,
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

  const openFoodDetail = (dish, restaurant) => {
    setSelectedDish(dish);
    if (restaurant) setSelectedRestaurant(restaurant);
    setDishQuantity(1);
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
          title="Direct Beach Services & Dining"
          subtitle="Contact verified auto drivers, explore live food menus & dishes, and find beachfront stays."
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
                  ? 'text-white font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.id ? accentColor : undefined,
                boxShadow: selectedCategory === cat.id ? `0 4px 14px ${glowColor}` : undefined,
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
                    className={`flex flex-col justify-between overflow-hidden ${cardRadius} border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition-all hover:shadow-md`}
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
                    className={`group flex flex-col justify-between overflow-hidden ${cardRadius} border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-sky-500/40`}
                  >
                    <div>
                      {/* Restaurant Cover / Banner */}
                      <div
                        className="relative mb-2.5 overflow-hidden rounded-xl aspect-video flex items-center justify-center border bg-slate-900"
                        style={{
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                        {item.restaurantDetails?.dietaryType === 'veg' || item.restaurantDetails?.isPureVeg ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                            🟢 Veg
                          </span>
                        ) : item.restaurantDetails?.dietaryType === 'seafood' ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-cyan-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs flex items-center gap-0.5">
                            🦐 Seafood
                          </span>
                        ) : item.restaurantDetails?.dietaryType === 'fried' ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs flex items-center gap-0.5">
                            🍟 Snacks
                          </span>
                        ) : item.restaurantDetails?.dietaryType === 'non-veg' ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                            🔴 Non-Veg
                          </span>
                        ) : null}

                        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-xs px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {item.restaurantDetails?.menuItems?.length || 0} Dishes
                        </span>
                      </div>

                      {/* Name & Cuisines */}
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:opacity-85 transition-opacity truncate">
                        {item.name}
                      </h3>
                      <p className="mt-0.5 text-[10.5px] text-gray-500 dark:text-slate-400 truncate">
                        {item.restaurantDetails?.cuisineTypes?.join(', ') || 'Malabar, Seafood, Grills'}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500">
                        <span className="truncate flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="truncate">{item.restaurantDetails?.openingHours || '11 AM - 11 PM'}</span>
                        </span>
                        <span className="inline-flex items-center gap-0.5 font-bold text-amber-500 shrink-0">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {item.rating || 4.8}
                        </span>
                      </div>
                    </div>

                    {/* View Menu Action */}
                    <div
                      className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold"
                      style={{ color: accentColor }}
                    >
                      <span>Explore Food Menu</span>
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
                  className={`group flex flex-col justify-between overflow-hidden ${cardRadius} border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm transition-all hover:shadow-md cursor-pointer`}
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
          MODAL 1: RESTAURANT & FOOD MENU EXPLORER (Image 2 UX Concept)
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedRestaurant && portalTarget && createPortal(
        <div
          className="absolute inset-0 z-[9990] flex items-end sm:items-center justify-center animate-in fade-in duration-200"
          style={{
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={() => setSelectedRestaurant(null)}
        >
          <div
            className="w-full max-w-md h-[94%] sm:h-[88%] rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xl transition-all flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Restaurant Hero Banner with Image from Backend Settings */}
            <div className="relative h-44 sm:h-48 shrink-0 bg-slate-950 overflow-hidden">
              <img
                src={selectedRestaurant.image || CULINARY_FALLBACKS.default}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60" />

              {/* Top Navigation Row */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors border border-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-white/10">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {selectedRestaurant.rating || 4.8}
                  </span>
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors border border-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Restaurant Info on Banner */}
              <div className="absolute bottom-3 inset-x-4 z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="rounded-md bg-emerald-500/90 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 tracking-wider">
                    Verified Beach Stall
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {selectedRestaurant.restaurantDetails?.openingHours || '11 AM - 11 PM'}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm truncate">
                  {selectedRestaurant.name}
                </h2>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{selectedRestaurant.location}</span>
                </p>
              </div>
            </div>

            {/* Sub-Header / Quick Call Action */}
            <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200">
                  {currentDishes.length} Available Food Dishes
                </p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  Tap any dish to customize and order directly
                </p>
              </div>
              <a
                href={`tel:${String(selectedRestaurant.phone || '').replace(/[^\d+]/g, '')}`}
                onClick={(e) => handleMakeCall(selectedRestaurant, e)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all shrink-0"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 3px 12px ${glowColor}`,
                }}
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call Stall</span>
              </a>
            </div>

            {/* Find by Category Pills (Image 2 Concept) */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
                  Find by Category
                </span>
                <button
                  onClick={() => setSelectedFoodCategory('ALL')}
                  className="text-[11px] font-bold"
                  style={{ color: accentColor }}
                >
                  See All
                </button>
              </div>

              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 text-xs">
                {FOOD_CATEGORIES.map((cat) => {
                  const isActive = selectedFoodCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedFoodCategory(cat.id)}
                      className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all select-none border ${
                        isActive
                          ? 'text-white shadow-sm ring-1 ring-white/20'
                          : 'bg-gray-100/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 border-gray-200/60 dark:border-slate-700/60 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: isActive ? accentColor : undefined,
                        borderColor: isActive ? accentColor : undefined,
                        boxShadow: isActive ? `0 4px 14px ${glowColor}` : undefined,
                      }}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Food Grid (Image 2 UX Concept) */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
              {filteredDishes.length === 0 ? (
                <div className="my-8 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 p-8 text-center text-gray-400 text-xs">
                  <Utensils className="mx-auto h-8 w-8 text-gray-400 mb-2 opacity-60" />
                  <p className="font-bold text-gray-700 dark:text-slate-300">No dishes in this category</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Please check other categories or call the restaurant directly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-6">
                  {filteredDishes.map((dish, idx) => {
                    const dishId = dish._id || `${selectedRestaurant._id}-${dish.name}-${idx}`;
                    const isFav = favorites.includes(dishId);
                    const dishImg = getDishImage(dish);

                    return (
                      <div
                        key={dishId}
                        onClick={() => openFoodDetail(dish, selectedRestaurant)}
                        className={`group flex flex-col justify-between overflow-hidden ${cardRadius} border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-sky-500/40`}
                      >
                        {/* Food Image Container */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                          <img
                            src={dishImg}
                            alt={dish.name}
                            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                          {/* Dietary Dot Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[9px] font-bold shadow-xs ${
                                dish.type === 'veg'
                                  ? 'border-green-600 bg-green-500 text-white'
                                  : dish.type === 'seafood'
                                  ? 'border-cyan-600 bg-cyan-500 text-white'
                                  : 'border-rose-600 bg-rose-500 text-white'
                              }`}
                            >
                              {dish.type === 'veg' ? '●' : dish.type === 'seafood' ? '🦐' : '▲'}
                            </span>
                          </div>

                          {/* Interactive Favorite Heart */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(dishId, e)}
                            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-xs transition-transform active:scale-75"
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors ${
                                isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
                              }`}
                            />
                          </button>

                          {/* Special Tag */}
                          {dish.isSpecial && (
                            <span className="absolute bottom-2 left-2 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white flex items-center gap-0.5 shadow-xs">
                              <Sparkles className="h-2.5 w-2.5" /> Special
                            </span>
                          )}
                        </div>

                        {/* Dish Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:opacity-85">
                              {dish.name}
                            </h4>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400">
                              <span className="flex items-center gap-0.5 font-bold text-amber-500">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                4.8
                              </span>
                              <span>•</span>
                              <span>⏱️ 15-20m</span>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <span
                              className="text-xs sm:text-sm font-extrabold"
                              style={{ color: accentColor }}
                            >
                              ₹{dish.price}
                            </span>
                            <span
                              className="rounded-lg px-2 py-1 text-[10px] font-bold text-white shadow-xs group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: accentColor,
                              }}
                            >
                              Order
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 2: DEDICATED FOOD DETAIL SCREEN (Image 3 UX Concept)
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedDish && portalTarget && createPortal(
        <div
          className="absolute inset-0 z-[9999] flex items-end sm:items-center justify-center animate-in fade-in duration-200"
          style={{
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="w-full max-w-md h-[95%] sm:h-[90%] rounded-t-[36px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-2xl transition-all flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Food Image Header */}
            <div className="relative h-64 sm:h-72 shrink-0 bg-slate-950 overflow-hidden">
              <img
                src={getDishImage(selectedDish)}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

              {/* Floating Top Control Bar */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <button
                  onClick={() => setSelectedDish(null)}
                  className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-transform active:scale-90 border border-white/10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="text-xs font-bold text-white/90 drop-shadow-sm uppercase tracking-wider">
                  About This Menu
                </span>
                <button
                  onClick={(e) => toggleFavorite(selectedDish._id || selectedDish.name, e)}
                  className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-transform active:scale-90 border border-white/10"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(selectedDish._id || selectedDish.name)
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-white'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Image Carousel Dot Indicator */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                <span className="h-1.5 w-6 rounded-full bg-white shadow-sm" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Food Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Title & Price Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>{selectedDish.name}</span>
                    <span className="text-base">
                      {selectedDish.type === 'veg' ? '🥗' : selectedDish.type === 'seafood' ? '🦐' : '🍔'}
                    </span>
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>{selectedRestaurant?.name || 'Muzhappilangad Beach Dining'}</span>
                  </p>
                </div>
                <span
                  className="text-xl font-black shrink-0"
                  style={{ color: accentColor }}
                >
                  ₹{selectedDish.price}
                </span>
              </div>

              {/* Highlight Badges Row (Image 3 Concept) */}
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-gray-50 dark:bg-slate-800/60 p-3 border border-gray-100 dark:border-slate-800 text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-500">⚡</span>
                  <span>Freshly Made</span>
                </span>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>15 - 20 min</span>
                </span>
                <span className="text-gray-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">4.8 Rating</span>
                </span>
              </div>

              {/* Description Section */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-slate-200">
                  Description
                </h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-400">
                  {selectedDish.description ||
                    `${selectedDish.name} is a premier signature delicacy prepared with fresh local ingredients by ${selectedRestaurant?.name || 'our beach kitchen'}. Highly recommended for beach visitors!`}
                </p>
              </div>

              {/* Recommended For You Section (Image 3 Concept) */}
              {recommendedDishes.length > 0 && (
                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-slate-200">
                      Recommended For You
                    </h3>
                    <span className="text-[11px] font-semibold text-gray-400">
                      More from stall
                    </span>
                  </div>

                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                    {recommendedDishes.map((rec) => (
                      <div
                        key={rec._id || rec.name}
                        onClick={() => {
                          setSelectedDish(rec);
                          setDishQuantity(1);
                        }}
                        className="w-36 shrink-0 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/80 p-2 shadow-2xs hover:shadow-sm cursor-pointer transition-all hover:scale-102"
                      >
                        <div className="h-20 w-full rounded-xl overflow-hidden bg-slate-900 mb-2">
                          <img
                            src={getDishImage(rec)}
                            alt={rec.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {rec.name}
                        </p>
                        <p className="text-xs font-extrabold mt-0.5" style={{ color: accentColor }}>
                          ₹{rec.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Order Bar (Image 3 UX Concept) */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-between gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center gap-3 rounded-2xl bg-gray-100 dark:bg-slate-800 px-3 py-2 border border-gray-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDishQuantity((q) => Math.max(1, q - 1))}
                  className="h-7 w-7 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-white flex items-center justify-center font-bold shadow-2xs hover:bg-gray-50 active:scale-90 transition-transform"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-extrabold text-gray-900 dark:text-white min-w-[16px] text-center">
                  {dishQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setDishQuantity((q) => Math.min(20, q + 1))}
                  className="h-7 w-7 rounded-xl bg-white dark:bg-slate-700 text-gray-800 dark:text-white flex items-center justify-center font-bold shadow-2xs hover:bg-gray-50 active:scale-90 transition-transform"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Main Call to Order Action Button */}
              <button
                type="button"
                onClick={(e) =>
                  handleMakeCall(selectedRestaurant, e, {
                    dishName: selectedDish.name,
                    quantity: dishQuantity,
                    totalPrice: selectedDish.price * dishQuantity,
                  })
                }
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-lg active:scale-98 transition-all hover:brightness-110 cursor-pointer"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 6px 20px ${glowColor}`,
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Call to Order (₹{selectedDish.price * dishQuantity})</span>
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 3: RESORT / STAY DETAIL MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedResort && portalTarget && createPortal(
        <div
          className="absolute inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          style={{
            background: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={() => setSelectedResort(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-2xl transition-all max-h-[90%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Hotel className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedResort.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{selectedResort.location}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResort(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Tariff */}
              <div className="flex items-center justify-between rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 p-3">
                <span className="text-xs text-purple-900 dark:text-purple-200 font-medium">Estimated Tariff</span>
                <span className="text-base font-extrabold text-purple-700 dark:text-purple-300">
                  ₹{selectedResort.stayDetails?.pricePerNight || 2500} / night
                </span>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-2">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedResort.stayDetails?.amenities || ['Beach View', 'AC Rooms', 'Wi-Fi', 'Free Parking']).map((amenity, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 p-2 text-xs text-gray-700 dark:text-slate-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Reception */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
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
