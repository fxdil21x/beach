import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  Car,
  Hotel,
  Plus,
  Search,
  Phone,
  MapPin,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Flame,
  Fish,
  Leaf,
  Loader2,
  Upload,
  ArrowLeft,
  FolderPlus,
  Tag,
  Check,
} from 'lucide-react';
import * as serviceApi from '../../api/serviceApi.js';


export default function ServicesManagement() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const tabFromUrl = searchParams.get('tab') || 'restaurant';
  const restaurantIdFromUrl = searchParams.get('restaurantId');

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl); // 'restaurant' | 'transport' | 'stay'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Navigation state
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [managingMenuRestaurant, setManagingMenuRestaurant] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Category management state
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Food Item Modal & form state
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState(null);
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [dishAvailabilityFilter, setDishAvailabilityFilter] = useState('all'); // 'all' | 'in_stock' | 'sold_out'
  const [selectedFoodCategoryFilter, setSelectedFoodCategoryFilter] = useState('ALL');

  // Service form state (Create / Edit Restaurant, Taxi, Resort)
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

  // Food item form
  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'Main Course',
    type: 'non-veg',
    price: '',
    description: '',
    image: '',
    isSpecial: false,
    isAvailable: true,
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync tab with URL
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setManagingMenuRestaurant(null);
    setSearchParams({ tab });
  };

  // Load all services from API
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

  // Deep-linking: Load restaurant menu if restaurantId is in URL
  useEffect(() => {
    if (!restaurantIdFromUrl) {
      setManagingMenuRestaurant(null);
      return;
    }

    // Try finding in current loaded services
    const match = services.find((s) => s._id === restaurantIdFromUrl);
    if (match) {
      setManagingMenuRestaurant(match);
    } else if (!loading) {
      // Fetch directly if not in current list
      serviceApi
        .getServiceById(restaurantIdFromUrl)
        .then((res) => {
          if (res && res.data) {
            setManagingMenuRestaurant(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load restaurant by ID:', err);
          showToast('Restaurant not found', 'error');
        });
    }
  }, [restaurantIdFromUrl, services, loading]);

  // Available categories for current restaurant (clean, restaurant-specific)
  const availableCategories = useMemo(() => {
    if (!managingMenuRestaurant) return [];
    const custom = managingMenuRestaurant.restaurantDetails?.categories || [];
    const itemCats = (managingMenuRestaurant.restaurantDetails?.menuItems || []).map((i) => i.category).filter(Boolean);
    const combined = Array.from(new Set([...custom, ...itemCats]));
    return combined;
  }, [managingMenuRestaurant]);

  // Handle open Restaurant Menu view & update URL
  const handleOpenMenuManager = (restaurant) => {
    setManagingMenuRestaurant(restaurant);
    setEditingFoodItem(null);
    setIsFoodModalOpen(false);
    setDishSearchQuery('');
    setDishAvailabilityFilter('all');
    setSelectedFoodCategoryFilter('ALL');
    setSearchParams({ tab: 'restaurant', restaurantId: restaurant._id });
  };

  // Handle back to services list & clean URL
  const handleCloseMenuManager = () => {
    setManagingMenuRestaurant(null);
    setEditingFoodItem(null);
    setIsFoodModalOpen(false);
    setIsAddCategoryModalOpen(false);
    setSearchParams({ tab: activeTab });
  };

  // Filtered services for Directory Listing
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

  // Image Upload Handlers
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

  const handleFoodImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be under 8MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFoodForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Open Create Service Modal
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

  // Open Edit Service Modal
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

  // Save Service (Create / Update)
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
          categories: editingService?.restaurantDetails?.categories || [],
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

      let savedService = null;
      if (editingService) {
        const res = await serviceApi.updateService(editingService._id, payload);
        savedService = res?.data;
        showToast(`${serviceForm.name} updated successfully!`);
        if (managingMenuRestaurant && managingMenuRestaurant._id === editingService._id && savedService) {
          setManagingMenuRestaurant(savedService);
        }
      } else {
        const res = await serviceApi.createService(payload);
        savedService = res?.data;
        showToast(`${serviceForm.name} added to directory!`);
      }

      setIsAddServiceModalOpen(false);
      await loadServices();

      // If new restaurant added, immediately open its menu page with deep-link
      if (!editingService && serviceForm.category === 'restaurant' && savedService) {
        handleOpenMenuManager(savedService);
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
      if (managingMenuRestaurant && managingMenuRestaurant._id === service._id) {
        handleCloseMenuManager();
      }
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
      const res = await serviceApi.updateService(service._id, { status: nextStatus });
      const updated = res?.data || { ...service, status: nextStatus };
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? updated : s))
      );
      if (managingMenuRestaurant && managingMenuRestaurant._id === service._id) {
        setManagingMenuRestaurant(updated);
      }
      showToast(`${service.name} marked as ${nextStatus}`);
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  // ── Category Management Handlers ───────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showToast('Please enter a category name', 'error');
      return;
    }

    if (availableCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast('This category already exists', 'error');
      setSelectedFoodCategoryFilter(trimmed);
      setIsAddCategoryModalOpen(false);
      setNewCategoryName('');
      return;
    }

    try {
      setCategoryLoading(true);
      const updatedCategories = [...availableCategories, trimmed];
      const res = await serviceApi.updateService(managingMenuRestaurant._id, {
        restaurantDetails: {
          ...managingMenuRestaurant.restaurantDetails,
          categories: updatedCategories,
        },
      });

      if (res && res.data) {
        setManagingMenuRestaurant(res.data);
        setServices((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        setSelectedFoodCategoryFilter(trimmed);
        showToast(`Category "${trimmed}" added!`);
      }
      setNewCategoryName('');
      setIsAddCategoryModalOpen(false);
    } catch (err) {
      console.error('Failed to add category:', err);
      showToast('Failed to add category', 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (catToDelete, e) => {
    if (e) e.stopPropagation();
    const count = categoryCounts[catToDelete] || 0;
    if (count > 0) {
      if (!window.confirm(`Category "${catToDelete}" has ${count} dish(es). Removing this category will remove it from the tabs bar. Continue?`)) {
        return;
      }
    }
    try {
      setCategoryLoading(true);
      const currentList = managingMenuRestaurant?.restaurantDetails?.categories || [];
      const updatedCategories = currentList.filter((c) => c.toLowerCase() !== catToDelete.toLowerCase());
      const res = await serviceApi.updateService(managingMenuRestaurant._id, {
        restaurantDetails: {
          ...managingMenuRestaurant.restaurantDetails,
          categories: updatedCategories,
        },
      });

      if (res && res.data) {
        setManagingMenuRestaurant(res.data);
        setServices((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        if (selectedFoodCategoryFilter === catToDelete) {
          setSelectedFoodCategoryFilter('ALL');
        }
        showToast(`Category "${catToDelete}" removed`);
      }
    } catch (err) {
      console.error('Failed to remove category:', err);
      showToast('Failed to remove category', 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  // ── Food Item Management Handlers ──────────────────────────────────────────
  const handleOpenAddFoodModal = (preselectedCategory = null) => {
    setEditingFoodItem(null);
    const dType =
      managingMenuRestaurant?.restaurantDetails?.dietaryType ||
      (managingMenuRestaurant?.restaurantDetails?.isPureVeg ? 'veg' : 'all');
    let defaultType = 'non-veg';
    if (dType === 'veg' || managingMenuRestaurant?.restaurantDetails?.isPureVeg) {
      defaultType = 'veg';
    } else if (dType === 'seafood') {
      defaultType = 'seafood';
    }

    let defaultCat = preselectedCategory;
    if (!defaultCat || defaultCat === 'ALL') {
      defaultCat = selectedFoodCategoryFilter !== 'ALL' ? selectedFoodCategoryFilter : (availableCategories[0] || '');
    }

    setFoodForm({
      name: '',
      category: defaultCat,
      type: defaultType,
      price: '',
      description: '',
      image: '',
      isSpecial: false,
      isAvailable: true,
    });
    setIsFoodModalOpen(true);
  };

  const handleStartEditFood = (item) => {
    setEditingFoodItem(item);
    setFoodForm({
      name: item.name || '',
      category: item.category || availableCategories[0] || '',
      type: item.type || 'non-veg',
      price: item.price !== undefined ? String(item.price) : '',
      description: item.description || '',
      image: item.image || '',
      isSpecial: Boolean(item.isSpecial),
      isAvailable: item.isAvailable !== false,
    });
    setIsFoodModalOpen(true);
  };

  const handleSaveFoodItem = async (e) => {
    e.preventDefault();
    if (!foodForm.name.trim() || !foodForm.price) {
      showToast('Food name and price are required', 'error');
      return;
    }
    if (!foodForm.category?.trim()) {
      showToast('Please select or add a category first', 'error');
      return;
    }

    try {
      setActionLoading(true);
      let res;
      if (editingFoodItem) {
        res = await serviceApi.updateMenuItem(managingMenuRestaurant._id, editingFoodItem._id, {
          name: foodForm.name.trim(),
          category: foodForm.category,
          type: foodForm.type,
          price: Number(foodForm.price),
          description: foodForm.description,
          image: foodForm.image || '',
          isSpecial: Boolean(foodForm.isSpecial),
          isAvailable: Boolean(foodForm.isAvailable),
        });
        showToast(`"${foodForm.name}" updated successfully!`);
      } else {
        res = await serviceApi.addMenuItem(managingMenuRestaurant._id, {
          name: foodForm.name.trim(),
          category: foodForm.category,
          type: foodForm.type,
          price: Number(foodForm.price),
          description: foodForm.description,
          image: foodForm.image || '',
          isSpecial: Boolean(foodForm.isSpecial),
          isAvailable: true,
        });
        showToast(`"${foodForm.name}" added to menu!`);
      }

      if (res && res.data) {
        setManagingMenuRestaurant(res.data);
        setServices((prev) =>
          prev.map((s) => (s._id === res.data._id ? res.data : s))
        );
        setIsFoodModalOpen(false);
        setEditingFoodItem(null);
      }
    } catch (err) {
      console.error('Failed to save food item:', err);
      showToast(err.response?.data?.message || 'Failed to save food item', 'error');
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

  // Filter menu items for current restaurant
  const currentMenuItems = managingMenuRestaurant?.restaurantDetails?.menuItems || [];

  const categoryCounts = useMemo(() => {
    const counts = { ALL: currentMenuItems.length };
    availableCategories.forEach((cat) => {
      counts[cat] = 0;
    });
    currentMenuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [currentMenuItems, availableCategories]);

  const inStockCount = useMemo(() => {
    return currentMenuItems.filter((i) => i.isAvailable !== false).length;
  }, [currentMenuItems]);

  const soldOutCount = useMemo(() => {
    return currentMenuItems.filter((i) => i.isAvailable === false).length;
  }, [currentMenuItems]);

  const filteredMenuItems = useMemo(() => {
    return currentMenuItems.filter((item) => {
      if (selectedFoodCategoryFilter !== 'ALL' && item.category !== selectedFoodCategoryFilter) {
        return false;
      }
      if (dishAvailabilityFilter === 'in_stock' && item.isAvailable === false) {
        return false;
      }
      if (dishAvailabilityFilter === 'sold_out' && item.isAvailable !== false) {
        return false;
      }
      if (dishSearchQuery.trim()) {
        const q = dishSearchQuery.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [currentMenuItems, selectedFoodCategoryFilter, dishAvailabilityFilter, dishSearchQuery]);

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

      {/* ══════════════════════════════════════════════════════════════════════
          VIEW 1: RESTAURANT DETAIL & FOOD MENU MANAGEMENT
      ══════════════════════════════════════════════════════════════════════ */}
      {managingMenuRestaurant ? (
        <div className="space-y-6">
          {/* Top Navigation & Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseMenuManager}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft className="h-4 w-4 text-orange-400" />
                <span>Back to Restaurants</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span>Directory</span>
                <span>/</span>
                <span className="text-zinc-400">Restaurants</span>
                <span>/</span>
                <span className="text-orange-400 font-bold">{managingMenuRestaurant.name}</span>
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleStatus(managingMenuRestaurant)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                  managingMenuRestaurant.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                }`}
                title="Click to toggle live status"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    managingMenuRestaurant.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                  }`}
                />
                <span>{managingMenuRestaurant.status === 'active' ? 'Active & Live' : 'Hidden / Inactive'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditModal(managingMenuRestaurant)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-orange-400 transition-all cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Restaurant</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteService(managingMenuRestaurant)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900 transition-all cursor-pointer"
                title="Delete Restaurant"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Restaurant Banner & Overview Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-5 md:p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Left: Restaurant Details */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {managingMenuRestaurant.image ? (
                  <img
                    src={managingMenuRestaurant.image}
                    alt={managingMenuRestaurant.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-zinc-700 shadow-md shrink-0"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30 shrink-0">
                    <UtensilsCrossed className="h-9 w-9" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {managingMenuRestaurant.name}
                    </h1>

                    {/* Dietary badge */}
                    {(managingMenuRestaurant.restaurantDetails?.dietaryType === 'veg' ||
                      managingMenuRestaurant.restaurantDetails?.isPureVeg) && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-[11px] font-bold text-green-400 border border-green-500/20">
                        <Leaf className="h-3 w-3" /> Pure Veg
                      </span>
                    )}
                    {managingMenuRestaurant.restaurantDetails?.dietaryType === 'seafood' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-bold text-cyan-400 border border-cyan-500/20">
                        <Fish className="h-3 w-3" /> Seafood Focus
                      </span>
                    )}
                    {managingMenuRestaurant.restaurantDetails?.dietaryType === 'fried' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                        🍟 Fried & Fast Food
                      </span>
                    )}
                  </div>

                  {managingMenuRestaurant.tagline && (
                    <p className="text-xs sm:text-sm text-orange-400/90 font-medium">
                      {managingMenuRestaurant.tagline}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <span>{managingMenuRestaurant.restaurantDetails?.openingHours || '11:00 AM - 11:00 PM'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>{managingMenuRestaurant.location}</span>
                    </div>

                    {managingMenuRestaurant.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{managingMenuRestaurant.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Cuisines Tags */}
                  {managingMenuRestaurant.restaurantDetails?.cuisineTypes?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {managingMenuRestaurant.restaurantDetails.cuisineTypes.map((c, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700/50"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Quick Counters Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800/70 shrink-0">
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Foods</p>
                  <p className="text-lg sm:text-xl font-black text-orange-400 flex items-center justify-center gap-1 mt-0.5">
                    <Flame className="h-4 w-4" /> {currentMenuItems.length}
                  </p>
                </div>
                <div className="text-center px-2 border-x border-zinc-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">In Stock</p>
                  <p className="text-lg sm:text-xl font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" /> {inStockCount}
                  </p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sold Out</p>
                  <p className="text-lg sm:text-xl font-black text-rose-400 flex items-center justify-center gap-1 mt-0.5">
                    <XCircle className="h-4 w-4" /> {soldOutCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Action Toolbar: Add Food, Add Category, Search, Filters ── */}
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4 backdrop-blur-sm shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Action Buttons: Add Food & Add Category */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenAddFoodModal()}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add Food Item</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700/80 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <FolderPlus className="h-4 w-4 text-orange-400" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Right Search & Availability Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={dishAvailabilityFilter}
                  onChange={(e) => setDishAvailabilityFilter(e.target.value)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="all">All Items ({currentMenuItems.length})</option>
                  <option value="in_stock">In Stock ({inStockCount})</option>
                  <option value="sold_out">Sold Out ({soldOutCount})</option>
                </select>

                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    placeholder="Search dishes..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-8 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                  />
                  {dishSearchQuery && (
                    <button
                      onClick={() => setDishSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-zinc-800/60">
              <button
                onClick={() => setSelectedFoodCategoryFilter('ALL')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedFoodCategoryFilter === 'ALL'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>All Foods</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-4.5 rounded-full px-1.5 text-[10px] font-bold ${
                    selectedFoodCategoryFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {categoryCounts['ALL'] || 0}
                </span>
              </button>

              {availableCategories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                return (
                  <div
                    key={cat}
                    className={`inline-flex items-center gap-1.5 rounded-xl pl-3 pr-2 py-1.5 font-semibold transition-all shrink-0 select-none ${
                      selectedFoodCategoryFilter === cat
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFoodCategoryFilter(cat)}
                      className="cursor-pointer"
                    >
                      {cat}
                    </button>
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-4.5 rounded-full px-1.5 text-[10px] font-bold ${
                        selectedFoodCategoryFilter === cat ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {count}
                    </span>
                    <button
                      type="button"
                      title={`Remove "${cat}" category`}
                      onClick={(e) => handleDeleteCategory(cat, e)}
                      className="ml-0.5 rounded-md p-0.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/10 border border-dashed border-orange-500/40 shrink-0 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Category</span>
              </button>
            </div>
          </div>

          {/* ── Food Items Cards Grid ── */}
          {filteredMenuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-400 mb-3">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">No food items found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
                {dishSearchQuery || selectedFoodCategoryFilter !== 'ALL' || dishAvailabilityFilter !== 'all'
                  ? 'No dishes match your current category or search filters. Try switching category or resetting filters.'
                  : 'This restaurant does not have any foods added yet. Click the button below to add the first dish!'}
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddFoodModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Food Item</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => (
                <div
                  key={item._id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition-all hover:shadow-xl relative ${
                    item.isAvailable !== false
                      ? 'border-zinc-800/90 bg-zinc-900/80 hover:border-zinc-700'
                      : 'border-zinc-800/40 bg-zinc-950/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Dish Photo or Type Icon */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover border border-zinc-700 shadow-sm shrink-0"
                      />
                    ) : (
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border text-sm font-bold shadow-sm ${
                          item.type === 'veg'
                            ? 'border-green-500/40 bg-green-500/10 text-green-400'
                            : item.type === 'seafood'
                            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                            : item.type === 'egg'
                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                            : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {item.type === 'veg' ? '🟢 VEG' : item.type === 'seafood' ? '🦐 SEAFOOD' : item.type === 'egg' ? '🍳 EGG' : '🔴 NON'}
                      </div>
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                        <span className="text-sm font-black text-orange-400 shrink-0">₹{item.price}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">
                          {item.category}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${
                            item.type === 'veg'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : item.type === 'seafood'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : item.type === 'egg'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {item.type === 'veg'
                            ? '🟢 Veg'
                            : item.type === 'seafood'
                            ? '🦐 Seafood'
                            : item.type === 'egg'
                            ? '🟡 Egg'
                            : '🔴 Non-Veg'}
                        </span>

                        {item.isSpecial && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                            <Sparkles className="h-3 w-3" /> Special
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 pt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    {/* Live Stock Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFoodStock(item._id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                        item.isAvailable !== false
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                      }`}
                      title="Click to toggle availability"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.isAvailable !== false ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      <span>{item.isAvailable !== false ? 'In Stock' : 'Sold Out'}</span>
                    </button>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEditFood(item)}
                        className="inline-flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-orange-500 hover:text-white transition-all cursor-pointer shadow-sm"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFoodItem(item._id, item.name)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-rose-950/50 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Food"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
            VIEW 2: DIRECTORY LISTING (Restaurants, Drivers, Resorts)
        ══════════════════════════════════════════════════════════════════════ */
        <>
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
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>
                Add {activeTab === 'restaurant' ? 'Restaurant' : activeTab === 'transport' ? 'Driver / Auto' : 'Resort'}
              </span>
            </button>
          </div>

          {/* Category Selector Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => handleTabChange('restaurant')}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'restaurant'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span>Restaurants & Food</span>
              </button>

              <button
                onClick={() => handleTabChange('transport')}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'transport'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Auto & Taxi Rides</span>
              </button>

              <button
                onClick={() => handleTabChange('stay')}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
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

          {/* Directory Listings Grid */}
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
                Add your first {activeTab} to make it available for beach visitors and residents.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 cursor-pointer"
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
                      {/* Top Badges & Actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border ${
                              service.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                service.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                              }`}
                            />
                            {service.status === 'active' ? 'Active & Live' : 'Hidden / Inactive'}
                          </span>
                          {service.category === 'restaurant' && (
                            <>
                              {(service.restaurantDetails?.dietaryType === 'veg' ||
                                service.restaurantDetails?.isPureVeg) && (
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
                              {(service.restaurantDetails?.dietaryType === 'all' ||
                                !service.restaurantDetails?.dietaryType) &&
                                !service.restaurantDetails?.isPureVeg && (
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
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
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
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteService(service);
                            }}
                            title="Delete Service"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
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

                      {/* Specific Meta Info */}
                      {service.category === 'restaurant' && (
                        <div className="space-y-2 rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60 text-xs">
                          <div className="flex items-center justify-between text-zinc-300">
                            <span className="flex items-center gap-1.5 text-zinc-400">
                              <Clock className="h-3.5 w-3.5 text-orange-400" /> Timing:
                            </span>
                            <span className="font-medium text-zinc-200">
                              {service.restaurantDetails?.openingHours || '11 AM - 11 PM'}
                            </span>
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
                            <span className="font-semibold text-zinc-200">
                              {service.transportDetails?.driverName || service.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Vehicle No:</span>
                            <span className="font-mono font-bold text-orange-400 uppercase bg-orange-950/30 px-2 py-0.5 rounded border border-orange-900/40">
                              {service.transportDetails?.vehicleNumber || 'KL-13-STAND'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Vehicle Type:</span>
                            <span className="font-medium text-zinc-300 capitalize">
                              {service.transportDetails?.vehicleType?.replace('_', ' ') || 'Auto'}
                            </span>
                          </div>
                        </div>
                      )}

                      {service.category === 'stay' && (
                        <div className="space-y-2 rounded-xl bg-zinc-950/60 p-3 border border-zinc-800/60 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Tariff:</span>
                            <span className="font-bold text-emerald-400">
                              ₹{service.stayDetails?.pricePerNight || 2500} / night
                            </span>
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

                    {/* Card Action Button */}
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
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 1: ADD CATEGORY MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Menu Category</h3>
                  <p className="text-xs text-zinc-400">Create a new category for {managingMenuRestaurant?.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Biryani Specials, Juices & Shakes, Chef's Catch..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Quick suggestions */}
              <div>
                <p className="text-[11px] text-zinc-400 font-medium mb-1.5">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Biryani Specials', 'Juices & Shakes', 'Chinese & Noodles', 'Kerala Breakfast', 'Ice Creams', 'Chef Specials'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewCategoryName(sug)}
                      className="rounded-lg bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-orange-500/20 hover:text-orange-300 border border-zinc-700/60 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-lg shadow-orange-500/25"
                >
                  {categoryLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 2: ADD / EDIT FOOD DISH MODAL (With Category Selection)
      ──────────────────────────────────────────────────────────────────────── */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {editingFoodItem ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingFoodItem ? `Edit Dish: "${editingFoodItem.name}"` : 'Add Food Item to Menu'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {editingFoodItem ? 'Update details, price or dietary tags' : `Add a dish to ${managingMenuRestaurant?.name}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFoodModalOpen(false);
                  setEditingFoodItem(null);
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoodItem} className="space-y-4">
              {/* Food Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Food Name / Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    placeholder="e.g. Thalassery Dum Biriyani"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Price (₹) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    placeholder="180"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Category Selector with Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Menu Category <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddCategoryModalOpen(true);
                    }}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add New Category
                  </button>
                </div>
                {availableCategories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-orange-500/40 bg-orange-500/5 p-3 text-center">
                    <p className="text-xs text-zinc-300 font-medium mb-2">No category added for this restaurant yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Category First</span>
                    </button>
                  </div>
                ) : (
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="" disabled>-- Select Category --</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dietary Type Radio Buttons (Filtered by Restaurant Dietary Classification) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">Dietary Classification</label>
                  {managingMenuRestaurant?.restaurantDetails?.isPureVeg && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 rounded-md px-1.5 py-0.5">
                      Pure Veg Restaurant
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(managingMenuRestaurant?.restaurantDetails?.isPureVeg || managingMenuRestaurant?.restaurantDetails?.dietaryType === 'veg'
                    ? [{ id: 'veg', label: 'Pure Veg', icon: '🟢', sub: 'Vegetarian Only' }]
                    : managingMenuRestaurant?.restaurantDetails?.dietaryType === 'seafood'
                    ? [
                        { id: 'seafood', label: 'Seafood', icon: '🦐', sub: 'Fish / Prawn' },
                        { id: 'veg', label: 'Pure Veg', icon: '🟢', sub: 'Vegetarian' },
                      ]
                    : [
                        { id: 'non-veg', label: 'Non-Veg', icon: '🔴', sub: 'Chicken / Meat' },
                        { id: 'seafood', label: 'Seafood', icon: '🦐', sub: 'Fish / Prawn' },
                        { id: 'veg', label: 'Pure Veg', icon: '🟢', sub: 'Vegetarian' },
                        { id: 'egg', label: 'Egg', icon: '🟡', sub: 'Egg Dish' },
                      ]
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFoodForm({ ...foodForm, type: d.id })}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        foodForm.type === d.id
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500 ring-1 ring-orange-500/30 font-bold'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-base mb-0.5">{d.icon}</span>
                      <span className="text-xs">{d.label}</span>
                      <span className="text-[9px] text-zinc-500">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Ingredients */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Description / Portion / Ingredients Note (Optional)
                </label>
                <input
                  type="text"
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="e.g. Fragrant kaima rice cooked with Malabar spices, served with raita & pickle"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Dish Photo */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Dish Photo (Optional)</label>
                {foodForm.image ? (
                  <div className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                    <img
                      src={foodForm.image}
                      alt="Preview"
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-emerald-400 font-medium">Photo Attached ✓</p>
                      <p className="text-[10px] text-zinc-500">Ready to save</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFoodForm((prev) => ({ ...prev, image: '' }))}
                      className="p-1.5 text-zinc-400 hover:text-rose-400"
                      title="Remove Photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/80 px-3.5 py-2.5 hover:border-orange-500 cursor-pointer transition-all">
                    <Upload className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-zinc-300 font-medium">Upload Food Image</span>
                    <input type="file" accept="image/*" onChange={handleFoodImageFileChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="specialItemCheck"
                    checked={foodForm.isSpecial}
                    onChange={(e) => setFoodForm({ ...foodForm, isSpecial: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="specialItemCheck"
                    className="text-xs text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Today's Special / Highlight
                  </label>
                </div>

                {editingFoodItem && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="availItemCheck"
                      checked={foodForm.isAvailable}
                      onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="availItemCheck"
                      className="text-xs text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> In Stock
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsFoodModalOpen(false);
                    setEditingFoodItem(null);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-lg shadow-orange-500/25"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : editingFoodItem ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                  )}
                  <span>{editingFoodItem ? 'Save Changes' : 'Add Food Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          MODAL 3: ADD / EDIT SERVICE MODAL (Restaurant / Driver / Resort)
      ──────────────────────────────────────────────────────────────────────── */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
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
                  <h3 className="text-base font-bold text-white">
                    {editingService
                      ? `Edit ${editingService.name}`
                      : `Add New ${
                          serviceForm.category === 'restaurant'
                            ? 'Restaurant'
                            : serviceForm.category === 'transport'
                            ? 'Driver / Auto'
                            : 'Resort'
                        }`}
                  </h3>
                  <p className="text-xs text-zinc-400">Configure directory listing information</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddServiceModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {/* Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      {serviceForm.category === 'transport' ? 'Driver Name' : 'Name / Title'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder={
                        serviceForm.category === 'restaurant'
                          ? 'e.g. Thalassery Seafood Shack'
                          : serviceForm.category === 'transport'
                          ? 'e.g. Ramesh Kumar'
                          : 'e.g. Waves Beach Resort'
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Tagline / Highlight</label>
                    <input
                      type="text"
                      value={serviceForm.tagline}
                      onChange={(e) => setServiceForm({ ...serviceForm, tagline: e.target.value })}
                      placeholder="e.g. Fresh Catch & Drive-in View"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Direct Call Phone *</label>
                    <input
                      type="tel"
                      required
                      value={serviceForm.phone}
                      onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={serviceForm.whatsapp}
                      onChange={(e) => setServiceForm({ ...serviceForm, whatsapp: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Location / Beach Landmark *
                    </label>
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
                        <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
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

                    {/* Dietary Type Selection */}
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

                {serviceForm.category === 'transport' && (
                  <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
                    <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                      <Car className="h-4 w-4" /> Transport & Auto Settings
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Vehicle Registration Number</label>
                        <input
                          type="text"
                          value={serviceForm.vehicleNumber}
                          onChange={(e) => setServiceForm({ ...serviceForm, vehicleNumber: e.target.value })}
                          placeholder="e.g. KL-13-AB-1234"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Vehicle Type</label>
                        <select
                          value={serviceForm.vehicleType}
                          onChange={(e) => setServiceForm({ ...serviceForm, vehicleType: e.target.value })}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                        >
                          <option value="auto">Auto Rickshaw</option>
                          <option value="taxi">Taxi / Car</option>
                          <option value="tempo">Traveller / Mini Bus</option>
                        </select>
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

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingService ? 'Save Changes' : 'Create Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
