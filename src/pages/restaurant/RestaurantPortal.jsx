import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  LayoutDashboard,
  Bell,
  Volume2,
  VolumeX,
  MapPin,
  ExternalLink,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  FolderPlus,
  Upload,
  X,
  Sparkles,
  TrendingUp,
  DollarSign,
  PackageCheck,
  RefreshCw,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEmergency } from '../../context/EmergencyContext.jsx';
import * as serviceApi from '../../api/serviceApi.js';
import * as orderApi from '../../api/orderApi.js';

// Fallback beep using Web Audio API if network audio fails
function playBeepSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

export default function RestaurantPortal() {
  const { user, logout } = useAuth();
  const { socket } = useEmergency();
  const navigate = useNavigate();

  // Resolved restaurant ID
  const restaurantId = user?.restaurantId || user?.id || user?._id;

  // Tabs: 'orders' | 'menu' | 'settings' | 'dashboard'
  const [activeTab, setActiveTab] = useState('orders');

  // Restaurant details state
  const [restaurant, setRestaurant] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // OTP State for Dashboard Tab ('1234')
  const [isOtpUnlocked, setIsOtpUnlocked] = useState(() => {
    return sessionStorage.getItem('restaurant_otp_unlocked') === 'true';
  });
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Stats for Dashboard Tab
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null);

  // Menu Category Filter & Modals
  const [selectedMenuCategory, setSelectedMenuCategory] = useState('ALL');
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [dishActionLoading, setDishActionLoading] = useState(false);

  // Dish Form
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Main Course',
    type: 'non-veg',
    price: '',
    description: '',
    image: '',
    isSpecial: false,
    isAvailable: true,
  });

  // Settings Form
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    tagline: '',
    phone: '',
    whatsapp: '',
    location: '',
    openingHours: '',
    cuisineTypes: '',
    dietaryType: 'all',
    googlePayNumber: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── 1. Fetch Restaurant Details ─────────────────────────────────────────────
  const loadRestaurantDetails = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoadingRestaurant(true);
      const res = await serviceApi.getServiceById(restaurantId);
      if (res && res.data) {
        setRestaurant(res.data);
        setSettingsForm({
          name: res.data.name || '',
          tagline: res.data.tagline || '',
          phone: res.data.phone || '',
          whatsapp: res.data.whatsapp || '',
          location: res.data.location || '',
          openingHours: res.data.restaurantDetails?.openingHours || '11:00 AM - 11:00 PM',
          cuisineTypes: res.data.restaurantDetails?.cuisineTypes?.join(', ') || '',
          dietaryType: res.data.restaurantDetails?.dietaryType || 'all',
          googlePayNumber: res.data.restaurantDetails?.googlePayNumber || '',
        });
      }
    } catch (err) {
      console.error('Failed to load restaurant profile:', err);
      showToast('Failed to load restaurant profile', 'error');
    } finally {
      setLoadingRestaurant(false);
    }
  }, [restaurantId]);

  // ── 2. Fetch Orders ─────────────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoadingOrders(true);
      const res = await orderApi.getRestaurantOrders(restaurantId);
      if (res && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load restaurant orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [restaurantId]);

  // ── 3. Fetch Dashboard Stats (When Unlocked) ────────────────────────────────
  const loadStats = useCallback(async () => {
    if (!restaurantId || !isOtpUnlocked) return;
    try {
      setLoadingStats(true);
      const res = await orderApi.getRestaurantOrderStats(restaurantId);
      if (res && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [restaurantId, isOtpUnlocked]);

  useEffect(() => {
    loadRestaurantDetails();
    loadOrders();
  }, [loadRestaurantDetails, loadOrders]);

  useEffect(() => {
    if (activeTab === 'dashboard' && isOtpUnlocked) {
      loadStats();
    }
  }, [activeTab, isOtpUnlocked, loadStats]);

  // ── 4. Socket Listeners for Real-time Orders ────────────────────────────────
  useEffect(() => {
    if (!socket || !restaurantId) return;

    // Join restaurant specific notification room
    socket.emit('join:restaurant', restaurantId);

    const handleNewOrder = (newOrder) => {
      console.log('[Socket] Incoming new order:', newOrder);
      setOrders((prev) => [newOrder, ...prev.filter((o) => o._id !== newOrder._id)]);

      // Play alert sound if enabled
      if (soundEnabled) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.8;
          audio.play().catch(() => playBeepSound());
        } catch {
          playBeepSound();
        }
      }

      showToast(`🔔 New Order #${newOrder.orderNumber} received!`, 'success');
    };

    socket.on('order:new', handleNewOrder);

    // Multi-tab broadcast channel listener
    const unsubscribe = orderApi.subscribeToLocalOrders((msg) => {
      if (msg.type === 'order:new' && msg.order) {
        handleNewOrder(msg.order);
      }
    });

    return () => {
      socket.off('order:new', handleNewOrder);
      unsubscribe();
    };
  }, [socket, restaurantId, soundEnabled]);

  // ── 5. Order Status Update Handler ──────────────────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      if (res && res.data) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
        showToast(`Order marked as ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING').length;
  }, [orders]);

  // ── 6. OTP Verification Handler ─────────────────────────────────────────────
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput.trim() === '1234') {
      setIsOtpUnlocked(true);
      setOtpError(false);
      sessionStorage.setItem('restaurant_otp_unlocked', 'true');
      showToast('Dashboard unlocked successfully');
    } else {
      setOtpError(true);
      setOtpInput('');
    }
  };

  const handleLockDashboard = () => {
    setIsOtpUnlocked(false);
    sessionStorage.removeItem('restaurant_otp_unlocked');
    setOtpInput('');
  };

  // ── 7. Menu & Category Handlers ─────────────────────────────────────────────
  const availableCategories = useMemo(() => {
    if (!restaurant) return [];
    const custom = restaurant.restaurantDetails?.categories || [];
    const itemCats = (restaurant.restaurantDetails?.menuItems || []).map((i) => i.category).filter(Boolean);
    return Array.from(new Set([...custom, ...itemCats]));
  }, [restaurant]);

  const filteredMenuItems = useMemo(() => {
    const items = restaurant?.restaurantDetails?.menuItems || [];
    if (selectedMenuCategory === 'ALL') return items;
    return items.filter((i) => i.category === selectedMenuCategory);
  }, [restaurant, selectedMenuCategory]);

  const handleOpenAddDish = (cat = null) => {
    setEditingDish(null);
    setDishForm({
      name: '',
      category: cat || selectedMenuCategory !== 'ALL' ? selectedMenuCategory : (availableCategories[0] || 'Main Course'),
      type: 'non-veg',
      price: '',
      description: '',
      image: '',
      isSpecial: false,
      isAvailable: true,
    });
    setIsAddDishModalOpen(true);
  };

  const handleStartEditDish = (dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name || '',
      category: dish.category || availableCategories[0] || 'Main Course',
      type: dish.type || 'non-veg',
      price: dish.price !== undefined ? String(dish.price) : '',
      description: dish.description || '',
      image: dish.image || '',
      isSpecial: Boolean(dish.isSpecial),
      isAvailable: dish.isAvailable !== false,
    });
    setIsAddDishModalOpen(true);
  };

  const handleDishPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Photo size must be under 8MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDishForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    if (!dishForm.name.trim() || !dishForm.price) {
      showToast('Name and price are required', 'error');
      return;
    }

    try {
      setDishActionLoading(true);
      let res;
      if (editingDish) {
        res = await serviceApi.updateMenuItem(restaurantId, editingDish._id, {
          name: dishForm.name.trim(),
          category: dishForm.category,
          type: dishForm.type,
          price: Number(dishForm.price),
          description: dishForm.description,
          image: dishForm.image || '',
          isSpecial: Boolean(dishForm.isSpecial),
          isAvailable: Boolean(dishForm.isAvailable),
        });
        showToast(`"${dishForm.name}" updated!`);
      } else {
        res = await serviceApi.addMenuItem(restaurantId, {
          name: dishForm.name.trim(),
          category: dishForm.category,
          type: dishForm.type,
          price: Number(dishForm.price),
          description: dishForm.description,
          image: dishForm.image || '',
          isSpecial: Boolean(dishForm.isSpecial),
          isAvailable: true,
        });
        showToast(`"${dishForm.name}" added to menu!`);
      }

      if (res && res.data) {
        setRestaurant(res.data);
        setIsAddDishModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save dish:', err);
      showToast(err.response?.data?.message || 'Failed to save food dish', 'error');
    } finally {
      setDishActionLoading(false);
    }
  };

  const handleToggleDishAvailability = async (dishId) => {
    try {
      const res = await serviceApi.toggleMenuItemAvailability(restaurantId, dishId);
      if (res && res.data) {
        setRestaurant(res.data);
        showToast('Dish availability updated');
      }
    } catch (err) {
      console.error('Failed to toggle dish availability:', err);
      showToast('Failed to update dish status', 'error');
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" from your menu?`)) return;
    try {
      const res = await serviceApi.deleteMenuItem(restaurantId, dishId);
      if (res && res.data) {
        setRestaurant(res.data);
        showToast(`"${dishName}" removed from menu`);
      }
    } catch (err) {
      console.error('Failed to delete dish:', err);
      showToast('Failed to delete dish', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    const existing = restaurant?.restaurantDetails?.categories || [];
    if (existing.includes(catName)) {
      showToast('Category already exists', 'error');
      return;
    }

    try {
      const updatedCategories = [...existing, catName];
      const res = await serviceApi.updateService(restaurantId, {
        restaurantDetails: {
          ...restaurant.restaurantDetails,
          categories: updatedCategories,
        },
      });
      if (res && res.data) {
        setRestaurant(res.data);
        setNewCategoryName('');
        setIsCategoryModalOpen(false);
        showToast(`Category "${catName}" added!`);
      }
    } catch (err) {
      console.error('Failed to add category:', err);
      showToast('Failed to add category', 'error');
    }
  };

  // ── 8. Restaurant Settings Handlers ─────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await serviceApi.updateService(restaurantId, {
        name: settingsForm.name,
        tagline: settingsForm.tagline,
        phone: settingsForm.phone,
        whatsapp: settingsForm.whatsapp,
        location: settingsForm.location,
        restaurantDetails: {
          ...restaurant.restaurantDetails,
          openingHours: settingsForm.openingHours,
          cuisineTypes: settingsForm.cuisineTypes.split(',').map((c) => c.trim()).filter(Boolean),
          dietaryType: settingsForm.dietaryType,
          googlePayNumber: settingsForm.googlePayNumber,
        },
      });

      if (res && res.data) {
        setRestaurant(res.data);
        showToast('Restaurant details updated successfully!');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-200">
          <div
            className={`rounded-2xl px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-inner">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                {restaurant?.name || 'Restaurant Portal'}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {restaurant?.location || 'Muzhappilangad Beach'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playBeepSound();
            }}
            title={soundEnabled ? 'Order sound alert ON (click to mute)' : 'Order sound alert MUTED (click to enable)'}
            className={`rounded-xl p-2 text-xs border transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline font-semibold text-[11px]">
              {soundEnabled ? 'Sound ON' : 'Muted'}
            </span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-rose-950/30 hover:border-rose-800 hover:text-rose-300 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {/* Tab 1: Orders */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-orange-600 animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* Tab 2: Menu & Categories */}
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'menu'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Menu & Categories</span>
          </button>

          {/* Tab 3: Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'settings'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>

          {/* Tab 4: Dashboard (Protected by OTP) */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer select-none ${
              activeTab === 'dashboard'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
            {!isOtpUnlocked ? (
              <Lock className="h-3 w-3 text-amber-400" />
            ) : (
              <Unlock className="h-3 w-3 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Views Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: LIVE ORDERS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Orders Header & Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Live Customer Orders</span>
                  <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-lg">
                    {orders.length} Total
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  New orders with beach GPS location arrive here automatically with chime sound.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'ALL', label: 'All Orders' },
                  { id: 'PENDING', label: `Pending (${pendingOrdersCount})` },
                  { id: 'ACCEPTED', label: 'Accepted' },
                  { id: 'DELIVERED', label: 'Delivered' },
                  { id: 'REJECTED', label: 'Rejected' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(pill.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      orderStatusFilter === pill.id
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={loadOrders}
                  title="Refresh Orders"
                  className="rounded-xl p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Grid / Cards */}
            {loadingOrders && orders.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
                <p className="text-xs">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-500 mb-3">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300">No {orderStatusFilter.toLowerCase()} orders</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                  When visitors place orders on the beach, they will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const isPending = order.status === 'PENDING';
                  const isAccepted = order.status === 'ACCEPTED' || order.status === 'PREPARING';
                  const isDelivered = order.status === 'DELIVERED';
                  const isRejected = order.status === 'REJECTED' || order.status === 'CANCELLED';

                  return (
                    <div
                      key={order._id}
                      className={`rounded-2xl border bg-zinc-900/80 p-4 space-y-3.5 transition-all relative ${
                        isPending
                          ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                          : isAccepted
                          ? 'border-sky-500/40'
                          : isDelivered
                          ? 'border-emerald-500/30'
                          : 'border-zinc-800 opacity-75'
                      }`}
                    >
                      {/* Top Bar: Order ID + Status + Cash on Delivery Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-white">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              isPending
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                                : isAccepted
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : isDelivered
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
                          Cash on Delivery
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="rounded-xl bg-zinc-950/70 p-3 border border-zinc-800/80 space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-100">
                              <span className="text-orange-400 font-bold mr-1.5">{item.quantity}x</span>
                              {item.name}
                            </span>
                            <span className="font-mono font-bold text-zinc-300">
                              ₹{(item.price || 0) * (item.quantity || 1)}
                            </span>
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                          <span className="text-zinc-400 font-medium">Total Bill:</span>
                          <span className="font-black text-sm text-emerald-400 font-mono">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info & Beach Location */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-zinc-300">
                          <span className="text-zinc-500">Customer:</span>
                          <span className="font-bold text-zinc-200">
                            {order.customerName || 'Beach Guest'}
                          </span>
                        </div>

                        {order.customerPhone && (
                          <div className="flex items-center justify-between text-zinc-300">
                            <span className="text-zinc-500">Phone:</span>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="font-mono text-orange-400 hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          </div>
                        )}

                        {order.customerNotes && (
                          <div className="rounded-lg bg-zinc-950 p-2 text-[11px] text-zinc-400 border border-zinc-800/60">
                            <span className="text-zinc-500 font-semibold mr-1">Spot Note:</span>
                            <span>{order.customerNotes}</span>
                          </div>
                        )}

                        {/* GPS Location Button */}
                        {order.customerLocation?.mapsUrl && (
                          <a
                            href={order.customerLocation.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 py-2 px-3 text-xs font-bold transition-all"
                          >
                            <MapPin className="h-3.5 w-3.5 text-rose-400" />
                            <span>View Location on Google Maps</span>
                            <ExternalLink className="h-3 w-3 opacity-70 ml-0.5" />
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              disabled={updatingOrderId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                            >
                              {updatingOrderId === order._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              <span>Accept Order</span>
                            </button>
                            <button
                              type="button"
                              disabled={updatingOrderId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'REJECTED')}
                              className="rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-rose-950/40 hover:border-rose-800 text-zinc-400 hover:text-rose-300 py-2 px-3 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            type="button"
                            disabled={updatingOrderId === order._id}
                            onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                          >
                            {updatingOrderId === order._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <PackageCheck className="h-3.5 w-3.5" />
                            )}
                            <span>Mark as Delivered & Paid</span>
                          </button>
                        )}

                        {isDelivered && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed & Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: MENU & CATEGORIES
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Menu Dishes & Categories</span>
                  <span className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                    {restaurant?.restaurantDetails?.menuItems?.length || 0} Dishes
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Add new food items, manage prices, photos, and categories.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FolderPlus className="h-4 w-4 text-orange-400" />
                  <span>Add Category</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddDish()}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSelectedMenuCategory('ALL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedMenuCategory === 'ALL'
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                All Categories ({restaurant?.restaurantDetails?.menuItems?.length || 0})
              </button>
              {availableCategories.map((cat) => {
                const count = (restaurant?.restaurantDetails?.menuItems || []).filter(
                  (i) => i.category === cat
                ).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMenuCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedMenuCategory === cat
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Dishes Grid */}
            {filteredMenuItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-500 mb-3">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300">No dishes in this category</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  Add your first food item with photo and price.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddDish()}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 inline-flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Food Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMenuItems.map((dish) => (
                  <div
                    key={dish._id}
                    className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                  >
                    <div>
                      {/* Photo + Status Badge */}
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-zinc-800/80">
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <UtensilsCrossed className="h-10 w-10" />
                          </div>
                        )}

                        {dish.isSpecial && (
                          <span className="absolute top-2 left-2 rounded-lg bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-black flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Special
                          </span>
                        )}

                        <span
                          className={`absolute top-2 right-2 rounded-lg px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm border ${
                            dish.isAvailable !== false
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                              : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          }`}
                        >
                          {dish.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{dish.name}</h4>
                          <span className="font-mono font-black text-sm text-orange-400 shrink-0">
                            ₹{dish.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                            {dish.category || 'General'}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{dish.type || 'Non-Veg'}</span>
                        </div>
                        {dish.description && (
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                            {dish.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleDishAvailability(dish._id)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                          dish.isAvailable !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/25'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/25'
                        }`}
                      >
                        {dish.isAvailable !== false ? 'Mark Sold Out' : 'Mark In Stock'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditDish(dish)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                          title="Edit Dish"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(dish._id, dish.name)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: RESTAURANT SETTINGS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Restaurant Profile & Settings</h2>
              <p className="text-xs text-zinc-400">
                Update your restaurant contact numbers, cuisines, opening hours, and UPI details.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Beach Location / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.location}
                  onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={settingsForm.openingHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                    placeholder="11:00 AM - 11:00 PM"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cuisines (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.cuisineTypes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cuisineTypes: e.target.value })}
                    placeholder="Malabar, Seafood, Grills"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Google Pay Number / UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={settingsForm.googlePayNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, googlePayNumber: e.target.value })}
                  placeholder="e.g. 9876543210 or restaurant@upi"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                >
                  {savingSettings && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: DASHBOARD (PROTECTED BY OTP '1234')
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {!isOtpUnlocked ? (
              /* OTP Lock Screen */
              <div className="max-w-md mx-auto py-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="rounded-3xl border border-amber-500/30 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-md text-center space-y-5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
                    <KeyRound className="h-8 w-8" />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">
                      Security Verification Required
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      The restaurant sales & financial dashboard is protected. Enter your 4-digit PIN to proceed.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="flex justify-center">
                      <input
                        type="password"
                        maxLength={4}
                        autoFocus
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/\D/g, ''));
                          setOtpError(false);
                        }}
                        placeholder="••••"
                        className="w-48 text-center text-3xl font-mono tracking-widest rounded-2xl border border-zinc-700 bg-zinc-950 py-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {otpError && (
                      <p className="text-xs font-semibold text-rose-400 animate-in fade-in flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Incorrect PIN. (Hint: 1234)</span>
                      </p>
                    )}

                    {/* Numeric Keypad Helper */}
                    <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto pt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            if (otpInput.length < 4) {
                              setOtpInput((prev) => prev + n);
                              setOtpError(false);
                            }
                          }}
                          className="h-10 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-200 hover:bg-zinc-700 active:scale-95 transition-all"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setOtpInput('')}
                        className="h-10 rounded-xl bg-zinc-850 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (otpInput.length < 4) {
                            setOtpInput((prev) => prev + '0');
                            setOtpError(false);
                          }
                        }}
                        className="h-10 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-200 hover:bg-zinc-700 active:scale-95 transition-all"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpInput((prev) => prev.slice(0, -1))}
                        className="h-10 rounded-xl bg-zinc-850 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                      >
                        ⌫
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={otpInput.length !== 4}
                      className="w-full rounded-2xl bg-amber-500 py-3 text-xs font-bold text-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      Unlock Dashboard
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Unlocked Financial Dashboard Content */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Financial & Sales Dashboard</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        PIN Verified ✓
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Real-time revenue metrics, completed COD earnings, and order volume.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLockDashboard}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Lock Dashboard</span>
                  </button>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today's Sales */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-medium">Today's Revenue</span>
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="font-mono text-2xl font-black text-white">
                      ₹{stats?.todayRevenue || 0}
                    </div>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      Cash on Delivery collected today
                    </p>
                  </div>

                  {/* Total Orders */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-medium">Total Orders</span>
                      <ShoppingBag className="h-4 w-4 text-orange-400" />
                    </div>
                    <div className="font-mono text-2xl font-black text-white">
                      {stats?.totalOrders || orders.length}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      {stats?.todayOrders || 0} orders received today
                    </p>
                  </div>

                  {/* Delivered Rate */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-medium">Delivered / Paid</span>
                      <PackageCheck className="h-4 w-4 text-sky-400" />
                    </div>
                    <div className="font-mono text-2xl font-black text-white">
                      {stats?.deliveredOrders || orders.filter((o) => o.status === 'DELIVERED').length}
                    </div>
                    <p className="text-[11px] text-sky-400 font-semibold">
                      Completed orders to date
                    </p>
                  </div>

                  {/* Total Lifetime Revenue */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-medium">Lifetime COD Volume</span>
                      <TrendingUp className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="font-mono text-2xl font-black text-white">
                      ₹{stats?.totalRevenue || 0}
                    </div>
                    <p className="text-[11px] text-purple-400 font-semibold">
                      Cumulative sales volume
                    </p>
                  </div>
                </div>

                {/* Popular Dishes Breakdown */}
                {stats?.popularDishes && stats.popularDishes.length > 0 && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white">Top Ordered Dishes</h3>
                    <div className="space-y-2">
                      {stats.popularDishes.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-bold text-xs">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-zinc-100">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-zinc-400">{item.totalQuantity} ordered</span>
                            <span className="font-mono font-bold text-emerald-400">
                              ₹{item.totalRevenue}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT DISH MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingDish ? `Edit "${editingDish.name}"` : 'Add New Dish to Menu'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDishModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    placeholder="e.g. Thalassery Dum Biriyani"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    placeholder="180"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category *</label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  >
                    {(availableCategories.length > 0 ? availableCategories : ['Main Course', 'Starters', 'Seafood Specials']).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Dietary Type *</label>
                  <select
                    value={dishForm.type}
                    onChange={(e) => setDishForm({ ...dishForm, type: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="non-veg">Non-Veg (Chicken/Meat)</option>
                    <option value="veg">Pure Veg</option>
                    <option value="seafood">Seafood (Fish/Prawn/Crab)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Ingredients, preparation style, portion size..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Dish Photo</label>
                {dishForm.image ? (
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                    <img
                      src={dishForm.image}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-emerald-400 font-medium">Photo attached ✓</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDishForm((prev) => ({ ...prev, image: '' }))}
                      className="p-1 text-zinc-400 hover:text-rose-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/80 px-3.5 py-2.5 hover:border-orange-500 cursor-pointer transition-all">
                    <Upload className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-zinc-300 font-medium">Upload Food Image</span>
                    <input type="file" accept="image/*" onChange={handleDishPhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Highlight Toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="portalSpecialCheck"
                    checked={dishForm.isSpecial}
                    onChange={(e) => setDishForm({ ...dishForm, isSpecial: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="portalSpecialCheck" className="text-xs text-orange-300 font-medium cursor-pointer flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Highlight as Special
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="portalAvailCheck"
                    checked={dishForm.isAvailable}
                    onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="portalAvailCheck" className="text-xs text-emerald-300 font-medium cursor-pointer">
                    In Stock
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dishActionLoading}
                  className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shadow-md shadow-orange-500/20"
                >
                  {dishActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingDish ? 'Save Changes' : 'Add Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL: ADD CATEGORY MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Add Menu Category</h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Biryani Specials, Juices & Shakes..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-all cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
