import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UtensilsCrossed,
  Car,
  Hotel,
  Plus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  AlertCircle,
  Sliders,
  ChevronRight,
  Flame,
  Coffee,
  Fish,
  Leaf,
  Egg,
  ShieldAlert,
  Loader2,
  Upload,
  ImageIcon,
} from 'lucide-react';
import * as serviceApi from '../../api/serviceApi.js';

export default function ServicesManagement() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurant'); // 'restaurant' | 'transport' | 'stay'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [managingMenuRestaurant, setManagingMenuRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    category: 'restaurant',
    name: '',
    tagline: '',
    description: '',
    phone: '',
    whatsapp: '',
    location: 'Muzhappilangad Drive-in Beach',
    googleMapsUrl: '',
    image: '',
    rating: 4.8,
    // Restaurant specifics
    cuisineTypes: 'Malabar, Seafood, Traditional',
    openingHours: '11:00 AM - 11:00 PM',
    isPureVeg: false,
    dietaryType: 'all', // 'all' | 'veg' | 'non-veg' | 'seafood' | 'fried'
    // Transport specifics
    driverName: '',
    vehicleNumber: '',
    vehicleType: 'auto',
    standLocation: 'North Gate Auto Stand',
    baseFareNote: 'Meter / Fixed Beach Rate',
    // Stay specifics
    pricePerNight: 2500,
    amenities: 'Beach View, AC, Wi-Fi, Free Parking',
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
  });

  // Food item form state
  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'Main Course',
    type: 'non-veg',
    price: '',
    description: '',
    isSpecial: false,
  });
  const [selectedFoodCategoryFilter, setSelectedFoodCategoryFilter] = useState('ALL');

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be under 8MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setServiceForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await serviceApi.getServices({ category: activeTab });
      if (res && res.data) {
        setServices(res.data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      showToast('Failed to load service listings', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (s.category !== activeTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.transportDetails?.driverName?.toLowerCase().includes(q) ||
        s.transportDetails?.vehicleNumber?.toLowerCase().includes(q)
      );
    });
  }, [services, activeTab, searchQuery]);

  // Open Create / Edit modal
  const handleOpenCreateModal = () => {
    setEditingService(null);
    setServiceForm({
      category: activeTab,
      name: '',
      tagline: '',
      description: '',
      phone: '',
      whatsapp: '',
      location: 'Muzhappilangad Drive-in Beach',
      googleMapsUrl: '',
      image: '',
      rating: 4.8,
      cuisineTypes: 'Malabar, Seafood, Traditional',
      openingHours: '11:00 AM - 11:00 PM',
      isPureVeg: false,
      dietaryType: 'all',
      driverName: '',
      vehicleNumber: '',
      vehicleType: 'auto',
      standLocation: 'North Gate Auto Stand',
      baseFareNote: 'Meter / Fixed Beach Rate',
      pricePerNight: 2500,
      amenities: 'Beach View, AC, Wi-Fi, Free Parking',
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM',
    });
    setIsAddServiceModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setServiceForm({
      category: service.category,
      name: service.name || '',
      tagline: service.tagline || '',
      description: service.description || '',
      phone: service.phone || '',
      whatsapp: service.whatsapp || '',
      location: service.location || '',
      googleMapsUrl: service.googleMapsUrl || '',
      image: service.image || '',
      rating: service.rating || 4.8,
      cuisineTypes: service.restaurantDetails?.cuisineTypes?.join(', ') || 'Malabar, Seafood',
      openingHours: service.restaurantDetails?.openingHours || '11:00 AM - 11:00 PM',
      isPureVeg: service.restaurantDetails?.isPureVeg || false,
      dietaryType: service.restaurantDetails?.dietaryType || (service.restaurantDetails?.isPureVeg ? 'veg' : 'all'),
      driverName: service.transportDetails?.driverName || '',
      vehicleNumber: service.transportDetails?.vehicleNumber || '',
      vehicleType: service.transportDetails?.vehicleType || 'auto',
      standLocation: service.transportDetails?.standLocation || 'North Gate Auto Stand',
      baseFareNote: service.transportDetails?.baseFareNote || 'Meter / Fixed Beach Rate',
      pricePerNight: service.stayDetails?.pricePerNight || 2500,
      amenities: service.stayDetails?.amenities?.join(', ') || 'Beach View, AC, Wi-Fi',
      checkInTime: service.stayDetails?.checkInTime || '12:00 PM',
      checkOutTime: service.stayDetails?.checkOutTime || '11:00 AM',
    });
    setIsAddServiceModalOpen(true);
  };

  // Submit Service Form
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.phone || !serviceForm.location) {
      showToast('Please fill all required fields (Name, Phone, Location)', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        category: serviceForm.category,
        name: serviceForm.name,
        tagline: serviceForm.tagline,
        description: serviceForm.description,
        phone: serviceForm.phone,
        whatsapp: serviceForm.whatsapp || serviceForm.phone,
        location: serviceForm.location,
        googleMapsUrl: serviceForm.googleMapsUrl,
        image: serviceForm.image,
        rating: Number(serviceForm.rating) || 4.8,
      };

      if (serviceForm.category === 'restaurant') {
        payload.restaurantDetails = {
          cuisineTypes: serviceForm.cuisineTypes.split(',').map((c) => c.trim()).filter(Boolean),
          openingHours: serviceForm.openingHours,
          isPureVeg: serviceForm.dietaryType === 'veg' || Boolean(serviceForm.isPureVeg),
          dietaryType: serviceForm.dietaryType || 'all',
        };
      } else if (serviceForm.category === 'transport') {
        payload.transportDetails = {
          driverName: serviceForm.name,
          vehicleNumber: serviceForm.vehicleNumber,
          vehicleType: serviceForm.vehicleType || 'auto',
          standLocation: serviceForm.location,
          baseFareNote: serviceForm.baseFareNote || 'Standard Meter Rate',
          isAvailable: true,
        };
      } else if (serviceForm.category === 'stay') {
        payload.stayDetails = {
          pricePerNight: Number(serviceForm.pricePerNight) || 0,
          amenities: serviceForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
          checkInTime: serviceForm.checkInTime,
          checkOutTime: serviceForm.checkOutTime,
        };
      }

      let createdService = null;
      if (editingService) {
        const res = await serviceApi.updateService(editingService._id, payload);
        createdService = res?.data;
        showToast(`${serviceForm.name} updated successfully!`);
      } else {
        const res = await serviceApi.createService(payload);
        createdService = res?.data;
        showToast(`${serviceForm.name} added to ${serviceForm.category} directory!`);
      }

      setIsAddServiceModalOpen(false);
      await loadServices();

      // Automatically open food menu manager if newly created service is a restaurant
      if (!editingService && serviceForm.category === 'restaurant' && createdService) {
        handleOpenMenuManager(createdService);
      }
    } catch (err) {
      console.error('Error saving service:', err);
      showToast(err.response?.data?.message || 'Failed to save service', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) return;
    try {
      await serviceApi.deleteService(service._id);
      showToast(`"${service.name}" deleted.`);
      loadServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      showToast('Failed to delete service', 'error');
    }
  };

  // Toggle active status
  const handleToggleStatus = async (service) => {
    const nextStatus = service.status === 'active' ? 'inactive' : 'active';
    try {
      await serviceApi.updateService(service._id, { status: nextStatus });
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, status: nextStatus } : s))
      );
      showToast(`${service.name} marked as ${nextStatus}`);
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  // ── Food Menu Management Handlers ──────────────────────────────────────────
  const handleOpenMenuManager = (restaurant) => {
    setManagingMenuRestaurant(restaurant);
    const dType = restaurant?.restaurantDetails?.dietaryType || (restaurant?.restaurantDetails?.isPureVeg ? 'veg' : 'all');
    let defaultType = 'non-veg';
    let defaultCategory = 'Main Course';

    if (dType === 'veg' || restaurant?.restaurantDetails?.isPureVeg) {
      defaultType = 'veg';
      defaultCategory = 'Main Course';
    } else if (dType === 'seafood') {
      defaultType = 'seafood';
      defaultCategory = 'Seafood Specials';
    } else if (dType === 'fried') {
      defaultType = 'non-veg';
      defaultCategory = 'Snacks & Quick Bites';
    }

    setFoodForm({
      name: '',
      category: defaultCategory,
      type: defaultType,
      price: '',
      description: '',
      isSpecial: false,
    });
    setSelectedFoodCategoryFilter('ALL');
  };

  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    if (!foodForm.name.trim() || !foodForm.price) {
      showToast('Food name and price are required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const res = await serviceApi.addMenuItem(managingMenuRestaurant._id, {
        name: foodForm.name.trim(),
        category: foodForm.category,
        type: foodForm.type,
        price: Number(foodForm.price),
        description: foodForm.description,
        isSpecial: Boolean(foodForm.isSpecial),
        isAvailable: true,
      });

      if (res && res.data) {
        setManagingMenuRestaurant(res.data);
        setServices((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        showToast(`"${foodForm.name}" added to menu!`);
        setFoodForm({
          name: '',
          category: foodForm.category,
          type: foodForm.type,
          price: '',
          description: '',
          isSpecial: false,
        });
      }
    } catch (err) {
      console.error('Failed to add food item:', err);
      showToast(err.response?.data?.message || 'Failed to add food item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFoodStock = async (itemId) => {
    try {
      const res = await serviceApi.toggleMenuItemAvailability(managingMenuRestaurant._id, itemId);
      if (res && res.data) {
        setManagingMenuRestaurant(res.data);
        setServices((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        showToast(res.message || 'Availability updated');
      }
    } catch {
      showToast('Failed to toggle stock status', 'error');
    }
  };

  const handleDeleteFoodItem = async (itemId, foodName) => {
    if (!window.confirm(`Delete "${foodName}" from menu?`)) return;
    try {
      const res = await serviceApi.deleteMenuItem(managingMenuRestaurant._id, itemId);
      if (res && res.data) {
        setManagingMenuRestaurant(res.data);
        setServices((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        showToast(`"${foodName}" removed from menu.`);
      }
    } catch {
      showToast('Failed to delete food item', 'error');
    }
  };

  // Filter menu items for modal
  const currentMenuItems = managingMenuRestaurant?.restaurantDetails?.menuItems || [];
  const filteredMenuItems = useMemo(() => {
    if (selectedFoodCategoryFilter === 'ALL') return currentMenuItems;
    return currentMenuItems.filter((item) => item.category === selectedFoodCategoryFilter);
  }, [currentMenuItems, selectedFoodCategoryFilter]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl transition-all border ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Services & Directory</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage Restaurants, Food Menus, Auto/Taxi Drivers, and Resorts available for visitors
              </p>
            </div>
          </div>
        </div>

        {/* Add Service Button */}
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Add {activeTab === 'restaurant' ? 'Restaurant' : activeTab === 'transport' ? 'Driver / Auto' : 'Resort'}</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('restaurant')}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'restaurant'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Restaurants & Food</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'transport'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Car className="h-4 w-4" />
            <span>Auto & Taxi Rides</span>
          </button>

          <button
            onClick={() => setActiveTab('stay')}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'stay'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Hotel className="h-4 w-4" />
            <span>Resorts & Stays</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Main Content Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm">Loading service directory...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-400 mb-3">
            {activeTab === 'restaurant' ? (
              <UtensilsCrossed className="h-7 w-7" />
            ) : activeTab === 'transport' ? (
              <Car className="h-7 w-7" />
            ) : (
              <Hotel className="h-7 w-7" />
            )}
          </div>
          <h3 className="text-base font-semibold text-zinc-200">No {activeTab}s added yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
            Add your first {activeTab} to make it available for beach visitors and residents on the user app.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add New {activeTab}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const isRestaurant = service.category === 'restaurant';
            return (
              <div
                key={service._id}
                onClick={isRestaurant ? () => handleOpenMenuManager(service) : undefined}
                className={`flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/70 p-5 backdrop-blur-sm transition-all hover:border-zinc-700 hover:shadow-xl relative group ${
                  isRestaurant ? 'cursor-pointer hover:border-orange-500/50 hover:bg-zinc-900/90' : ''
                }`}
              >
                <div>
                  {/* Top Badge & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                          service.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${service.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                        {service.status === 'active' ? 'Active & Live' : 'Hidden / Inactive'}
                      </span>
                      {service.category === 'restaurant' && (
                        <>
                          {(service.restaurantDetails?.dietaryType === 'veg' || service.restaurantDetails?.isPureVeg) && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-[11px] font-medium text-green-400 border border-green-500/20">
                              <Leaf className="h-3 w-3" /> Pure Veg
                            </span>
                          )}
                          {service.restaurantDetails?.dietaryType === 'seafood' && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-400 border border-cyan-500/20">
                              <Fish className="h-3 w-3" /> Seafood
                            </span>
                          )}
                          {service.restaurantDetails?.dietaryType === 'fried' && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                              🍟 Fried & Snacks
                            </span>
                          )}
                          {service.restaurantDetails?.dietaryType === 'non-veg' && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
                              🔴 Non-Veg
                            </span>
                          )}
                          {(service.restaurantDetails?.dietaryType === 'all' || !service.restaurantDetails?.dietaryType) && !service.restaurantDetails?.isPureVeg && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-400 border border-orange-500/20">
                              🍽️ All Items
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Edit / Delete / Toggle buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(service);
                        }}
                        title={service.status === 'active' ? 'Hide from user app' : 'Publish to user app'}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        {service.status === 'active' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-zinc-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(service);
                        }}
                        title="Edit Service Details"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(service);
                        }}
                        title="Delete Service"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                {/* Main Details */}
                <div className="flex gap-3.5 mb-3.5">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-16 w-16 rounded-xl object-cover border border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-800/80 text-orange-400 border border-zinc-700/50 shrink-0">
                      {activeTab === 'restaurant' ? (
                        <UtensilsCrossed className="h-7 w-7" />
                      ) : activeTab === 'transport' ? (
                        <Car className="h-7 w-7" />
                      ) : (
                        <Hotel className="h-7 w-7" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate">{service.name}</h3>
                    {service.tagline && (
                      <p className="text-xs text-orange-400/90 font-medium truncate">{service.tagline}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 truncate">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>
                  </div>
                </div>

                {/* Specific Meta info */}
                {service.category === 'restaurant' && (
                  <div className="space-y-2 rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="h-3.5 w-3.5 text-orange-400" /> Timing:
                      </span>
                      <span className="font-medium text-zinc-200">{service.restaurantDetails?.openingHours || '11 AM - 11 PM'}</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-400">Cuisines:</span>
                      <span className="font-medium text-zinc-200 truncate max-w-[170px]">
                        {service.restaurantDetails?.cuisineTypes?.join(', ') || 'Malabar, Seafood'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-zinc-300">
                      <span className="text-zinc-400 font-medium">Menu Dishes:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-orange-400">
                        <Flame className="h-3.5 w-3.5" />
                        {service.restaurantDetails?.menuItems?.length || 0} Foods Added
                      </span>
                    </div>
                  </div>
                )}

                {service.category === 'transport' && (
                  <div className="space-y-2 rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Driver Name:</span>
                      <span className="font-semibold text-zinc-200">{service.transportDetails?.driverName || service.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Vehicle No:</span>
                      <span className="font-mono font-bold text-orange-400 uppercase bg-orange-950/30 px-2 py-0.5 rounded border border-orange-900/40">
                        {service.transportDetails?.vehicleNumber || 'KL-13-STAND'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Vehicle Type:</span>
                      <span className="font-medium text-zinc-300 capitalize">{service.transportDetails?.vehicleType?.replace('_', ' ') || 'Auto'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Stand Location:</span>
                      <span className="font-medium text-zinc-300">{service.transportDetails?.standLocation || service.location}</span>
                    </div>
                  </div>
                )}

                {service.category === 'stay' && (
                  <div className="space-y-2 rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Tariff:</span>
                      <span className="font-bold text-emerald-400">₹{service.stayDetails?.pricePerNight || 2500} / night</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Amenities:</span>
                      <span className="font-medium text-zinc-300 truncate max-w-[170px]">
                        {service.stayDetails?.amenities?.join(', ') || 'Beach View, AC'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons at bottom of card */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center gap-2">
                {service.category === 'restaurant' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMenuManager(service);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500/15 py-2.5 px-3 text-xs font-bold text-orange-400 border border-orange-500/30 transition-all hover:bg-orange-500 hover:text-white cursor-pointer"
                  >
                    <Flame className="h-4 w-4" />
                    <span>Manage Menu ({service.restaurantDetails?.menuItems?.length || 0} Foods)</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </button>
                ) : (
                  <a
                    href={`tel:${service.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 py-2.5 px-3 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Call ({service.phone})</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 1: ADD / EDIT SERVICE MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                  {serviceForm.category === 'restaurant' ? (
                    <UtensilsCrossed className="h-5 w-5" />
                  ) : serviceForm.category === 'transport' ? (
                    <Car className="h-5 w-5" />
                  ) : (
                    <Hotel className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingService ? `Edit ${serviceForm.name}` : `Add New ${serviceForm.category === 'restaurant' ? 'Restaurant' : serviceForm.category === 'transport' ? 'Auto / Taxi' : 'Resort'}`}
                  </h2>
                  <p className="text-xs text-zinc-400">Fill in the details to publish to user directory</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddServiceModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Service Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, category: 'restaurant' })}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                      serviceForm.category === 'restaurant'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <UtensilsCrossed className="h-4 w-4" /> Restaurant
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, category: 'transport' })}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                      serviceForm.category === 'transport'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <Car className="h-4 w-4" /> Auto / Taxi
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, category: 'stay' })}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold border transition-all ${
                      serviceForm.category === 'stay'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <Hotel className="h-4 w-4" /> Resort / Stay
                  </button>
                </div>
              </div>

              {/* ────────────────── AUTO / TAXI SPECIFIC CLEAN FORM ────────────────── */}
              {serviceForm.category === 'transport' ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Driver Name *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value, driverName: e.target.value })}
                        placeholder="e.g. Ajmal"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Contact Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={serviceForm.phone}
                        onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                        placeholder="e.g. 9847123456"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Vehicle Registration No. *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.vehicleNumber}
                        onChange={(e) => setServiceForm({ ...serviceForm, vehicleNumber: e.target.value })}
                        placeholder="e.g. KL-13-AB-1234"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 uppercase placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Vehicle Type *</label>
                      <select
                        value={serviceForm.vehicleType}
                        onChange={(e) => setServiceForm({ ...serviceForm, vehicleType: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="auto">Auto Rickshaw (3-Seater) 🛺</option>
                        <option value="taxi_4seater">Sedan / 4-Seater Cab 🚕</option>
                        <option value="taxi_7seater">SUV / 7-Seater Taxi 🚙</option>
                        <option value="traveller">Tourist Traveller Van 🚐</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Stand Location *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.location}
                        onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value, standLocation: e.target.value })}
                        placeholder="e.g. Muzhappilangad North Gate Auto Stand"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Auto / Vehicle Photo</label>
                      {serviceForm.image ? (
                        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                          <img
                            src={serviceForm.image}
                            alt="Auto Preview"
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-emerald-400">Photo Attached ✓</p>
                            <p className="text-[10px] text-zinc-500">Ready to save</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, image: '' })}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400"
                            title="Remove Photo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/80 px-3.5 py-2 hover:border-orange-500 hover:bg-zinc-900/60 cursor-pointer transition-all">
                          <Upload className="h-4 w-4 text-orange-400" />
                          <span className="text-xs font-medium text-zinc-200">Upload Auto Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ────────────────── RESTAURANT & RESORT FORM ────────────────── */
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        {serviceForm.category === 'restaurant' ? 'Restaurant Name *' : 'Resort Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        placeholder={serviceForm.category === 'restaurant' ? 'e.g. Malabar Beach Restaurant' : 'e.g. Waves Beach Resort'}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Contact Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={serviceForm.phone}
                        onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                        placeholder="e.g. 9847123456"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Address / Location *</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.location}
                        onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                        placeholder="e.g. Main Drive-in Beach Road"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Cover Photo</label>
                      {serviceForm.image ? (
                        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                          <img
                            src={serviceForm.image}
                            alt="Cover Preview"
                            className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-emerald-400">Photo Attached ✓</p>
                            <p className="text-[10px] text-zinc-500">Ready to save</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, image: '' })}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400"
                            title="Remove Photo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/80 px-3.5 py-2 hover:border-orange-500 hover:bg-zinc-900/60 cursor-pointer transition-all">
                          <Upload className="h-4 w-4 text-orange-400" />
                          <span className="text-xs font-medium text-zinc-200">Upload Cover Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {serviceForm.category === 'restaurant' && (
                    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
                      <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <UtensilsCrossed className="h-4 w-4" /> Restaurant Settings
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Cuisines (Comma separated)</label>
                          <input
                            type="text"
                            value={serviceForm.cuisineTypes}
                            onChange={(e) => setServiceForm({ ...serviceForm, cuisineTypes: e.target.value })}
                            placeholder="Malabar, Seafood, Kerala Meals"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Opening Hours</label>
                          <input
                            type="text"
                            value={serviceForm.openingHours}
                            onChange={(e) => setServiceForm({ ...serviceForm, openingHours: e.target.value })}
                            placeholder="11:00 AM - 11:00 PM"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Dietary / Food Serving Type Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Food Serving Type / Menu Focus *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, dietaryType: 'all', isPureVeg: false })}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all text-left cursor-pointer ${
                              (serviceForm.dietaryType === 'all' || !serviceForm.dietaryType) && !serviceForm.isPureVeg
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-sm ring-1 ring-orange-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                            }`}
                          >
                            <span className="text-lg">🍽️</span>
                            <div>
                              <p className="font-bold text-zinc-100 leading-none">All Items</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Veg, Non-Veg & Seafood</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, dietaryType: 'veg', isPureVeg: true })}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all text-left cursor-pointer ${
                              serviceForm.dietaryType === 'veg' || serviceForm.isPureVeg
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                            }`}
                          >
                            <span className="text-lg">🟢</span>
                            <div>
                              <p className="font-bold text-zinc-100 leading-none">Pure Veg</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">100% Vegetarian</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, dietaryType: 'non-veg', isPureVeg: false })}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all text-left cursor-pointer ${
                              serviceForm.dietaryType === 'non-veg' && !serviceForm.isPureVeg
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                            }`}
                          >
                            <span className="text-lg">🔴</span>
                            <div>
                              <p className="font-bold text-zinc-100 leading-none">Non-Veg</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Chicken, Beef & Mutton</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, dietaryType: 'seafood', isPureVeg: false })}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all text-left cursor-pointer ${
                              serviceForm.dietaryType === 'seafood'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                            }`}
                          >
                            <span className="text-lg">🦐</span>
                            <div>
                              <p className="font-bold text-zinc-100 leading-none">Seafood</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Fresh Fish, Prawn & Crab</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, dietaryType: 'fried', isPureVeg: false })}
                            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all text-left cursor-pointer ${
                              serviceForm.dietaryType === 'fried'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                            }`}
                          >
                            <span className="text-lg">🍟</span>
                            <div>
                              <p className="font-bold text-zinc-100 leading-none">Fried & Snacks</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">Fish Fry, Fries & Bites</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {serviceForm.category === 'stay' && (
                    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
                      <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <Hotel className="h-4 w-4" /> Resort Settings
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Approx. Tariff per night (₹)</label>
                          <input
                            type="number"
                            value={serviceForm.pricePerNight}
                            onChange={(e) => setServiceForm({ ...serviceForm, pricePerNight: e.target.value })}
                            placeholder="2500"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Amenities (Comma separated)</label>
                          <input
                            type="text"
                            value={serviceForm.amenities}
                            onChange={(e) => setServiceForm({ ...serviceForm, amenities: e.target.value })}
                            placeholder="Beach View, Swimming Pool, AC, Wi-Fi"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingService ? 'Save Changes' : 'Create Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 2: RESTAURANT FOOD MENU MANAGER
      ──────────────────────────────────────────────────────────────────────── */}
      {managingMenuRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-6 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{managingMenuRestaurant.name}</span>
                    <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/20">
                      {currentMenuItems.length} Dishes
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">Add food items, set prices, and toggle daily availability</p>
                </div>
              </div>
              <button
                onClick={() => setManagingMenuRestaurant(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-5">
              {/* Form: Add New Food Item */}
              <div className="rounded-xl border border-orange-500/30 bg-orange-950/10 p-4">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add New Food Dish to Menu
                </h3>

                <form onSubmit={handleAddFoodItem} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Food Name / Title */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Food Name / Title *</label>
                      <input
                        type="text"
                        required
                        value={foodForm.name}
                        onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                        placeholder="e.g. Thalassery Dum Biriyani"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    {/* Food Category Dropdown */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Menu Category</label>
                      <select
                        value={foodForm.category}
                        onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="Main Course">Main Course</option>
                        <option value="Seafood Specials">Seafood Specials</option>
                        <option value="Starters">Starters</option>
                        <option value="Breads & Rice">Breads & Rice</option>
                        <option value="Snacks & Quick Bites">Snacks & Bites</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Beverages">Beverages & Juices</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Food Dietary Type */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Food Type</label>
                      <select
                        value={foodForm.type}
                        onChange={(e) => setFoodForm({ ...foodForm, type: e.target.value })}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="non-veg">Non-Veg 🔴</option>
                        <option value="seafood">Seafood 🦐</option>
                        <option value="veg">Pure Veg 🟢</option>
                        <option value="egg">Egg 🟡</option>
                      </select>
                    </div>

                    {/* Price in ₹ */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={foodForm.price}
                        onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                        placeholder="₹ 180"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Description / Ingredients (Optional)</label>
                    <input
                      type="text"
                      value={foodForm.description}
                      onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                      placeholder="e.g. Authentic Malabar Biriyani with tender meat cooked in fragrant kaima rice, raita & pickle"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Description & Today's Special Toggle */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="checkbox"
                        id="specialCheck"
                        checked={foodForm.isSpecial}
                        onChange={(e) => setFoodForm({ ...foodForm, isSpecial: e.target.checked })}
                        className="rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-0"
                      />
                      <label htmlFor="specialCheck" className="text-xs text-orange-300 font-medium flex items-center gap-1 cursor-pointer">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Today&apos;s Special / Fresh Catch Highlight
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Add Dish to Menu
                    </button>
                  </div>
                </form>
              </div>

              {/* Menu Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'Seafood Specials', 'Main Course', 'Starters', 'Breads & Rice', 'Snacks & Quick Bites', 'Desserts', 'Beverages'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFoodCategoryFilter(cat)}
                    className={`rounded-lg px-2.5 py-1 font-medium transition-all shrink-0 ${
                      selectedFoodCategoryFilter === cat
                        ? 'bg-zinc-200 text-zinc-950 font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Current Menu Items List */}
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                  No food dishes in this category yet. Add a dish above!
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                        item.isAvailable
                          ? 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
                          : 'border-zinc-800/40 bg-zinc-950/30 opacity-60'
                      }`}
                    >
                      {/* Left: Type badge & Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Veg / Non-Veg / Seafood Indicator */}
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] ${
                            item.type === 'veg'
                              ? 'border-green-500/40 bg-green-500/10 text-green-400'
                              : item.type === 'seafood'
                              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                              : item.type === 'egg'
                              ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                              : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {item.type === 'veg' ? '●' : item.type === 'seafood' ? '🦐' : item.type === 'egg' ? '🍳' : '▲'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            {item.isSpecial && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                                <Sparkles className="h-2.5 w-2.5" /> Special
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                          <p className="text-[10px] text-zinc-500 mt-0.5">{item.category}</p>
                        </div>
                      </div>

                      {/* Right: Price & Live Stock Toggle Button & Delete */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-white">₹{item.price}</span>

                        {/* 1-Click Availability Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleFoodStock(item._id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                          }`}
                          title="Click to toggle Stock Status"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFoodItem(item._id, item.name)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setManagingMenuRestaurant(null)}
                className="rounded-xl bg-zinc-800 px-5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Close Menu Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
