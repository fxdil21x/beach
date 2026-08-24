import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  Hotel,
  Utensils,
  Waves,
  Umbrella,
  Compass,
  Star,
  Search,
  PhoneCall,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MapPin,
  Navigation,
  ExternalLink,
  LocateFixed,
  Route,
  Check,
} from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import Button from '../../components/ui/Button.jsx';
import { userNav } from '../../config/navigation.js';

export default function Services() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', notes: '' });

  // Ride & Auto booking specific states
  const [pickupLocation, setPickupLocation] = useState('Muzhappilangad Beach (Current Location)');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destSearch, setDestSearch] = useState('');
  const [vehicleType, setVehicleType] = useState('auto'); // 'auto' | 'taxi'

  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!activeModal) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const deviceLayer = window.__deviceModalLayer;
    setPortalTarget(deviceLayer || document.body);
  }, [activeModal]);

  useEffect(() => {
    if (!activeModal) {
      resolvedRef.current = false;
      setPortalTarget(null);
    }
  }, [activeModal]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== 'nearby') {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Standard clean service categories
  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'transport', label: 'Rides & Auto' },
    { id: 'stay', label: 'Resorts & Stays' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'activities', label: 'Water Sports' },
    { id: 'rentals', label: 'Rentals' },
  ];

  // 10 KM Nearby Destinations from Muzhappilangad Beach Current Location
  const nearbyDestinations = [
    {
      id: 'dharmadam',
      name: 'Dharmadam Island & Beach',
      distance: '2.5 km',
      time: '6 mins',
      autoFare: '₹60',
      taxiFare: '₹120',
      type: 'Island & Beach',
    },
    {
      id: 'edakkad-station',
      name: 'Edakkad Railway Station',
      distance: '3.5 km',
      time: '8 mins',
      autoFare: '₹80',
      taxiFare: '₹150',
      type: 'Transit',
    },
    {
      id: 'andaloor',
      name: 'Andaloor Kavu Heritage Grove',
      distance: '4.2 km',
      time: '10 mins',
      autoFare: '₹90',
      taxiFare: '₹170',
      type: 'Heritage Site',
    },
    {
      id: 'kizhunna',
      name: 'Kizhunna & Ezhara Beach',
      distance: '5.5 km',
      time: '12 mins',
      autoFare: '₹120',
      taxiFare: '₹220',
      type: 'Twin Beach',
    },
    {
      id: 'thottada',
      name: 'Thottada Beach & Estuary',
      distance: '7.2 km',
      time: '16 mins',
      autoFare: '₹150',
      taxiFare: '₹270',
      type: 'River & Beach',
    },
    {
      id: 'thalassery-fort',
      name: 'Thalassery Fort & Sea Pier',
      distance: '9.0 km',
      time: '18 mins',
      autoFare: '₹180',
      taxiFare: '₹320',
      type: 'Fort & Town',
    },
    {
      id: 'overburys',
      name: 'Overbury’s Folly & Promenade',
      distance: '9.8 km',
      time: '20 mins',
      autoFare: '₹200',
      taxiFare: '₹350',
      type: 'Sunset Viewpoint',
    },
  ];

  const servicesList = [
    {
      id: 'auto-booking',
      category: 'transport',
      title: 'Auto & Taxi Ride',
      subtitle: 'Instant rides within 10 km',
      badge: 'Available 24/7',
      price: 'From ₹50',
      rating: 4.9,
      reviews: 128,
      gradient: 'from-amber-500/10 via-orange-500/5 to-amber-500/20 border-amber-200/80',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/20',
      icon: Car,
      phone: '+919876543210',
      description: 'Book instant auto-rickshaws and taxis from your current location at Muzhappilangad Beach to destinations within 10 km.',
      features: ['Auto GPS pickup', 'Fixed meter transparent fares', 'Verified drivers', 'Emergency support'],
      isRide: true,
    },
    {
      id: 'resort-booking',
      category: 'stay',
      title: 'Resort & Stay',
      subtitle: 'Beachfront cottages',
      badge: 'Top Rated',
      price: 'From ₹1,499/night',
      rating: 4.8,
      reviews: 94,
      gradient: 'from-indigo-500/10 via-purple-500/5 to-indigo-500/20 border-indigo-200/80',
      iconBg: 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/20',
      icon: Hotel,
      phone: '+919876543211',
      description: 'Book luxury beachfront resorts, cozy sea-view homestays, and budget guest houses near the drive-in beach.',
      features: ['Ocean view balcony', 'Free Wi-Fi & Breakfast', 'Direct beach access', 'AC Rooms available'],
    },
    {
      id: 'food-ordering',
      category: 'food',
      title: 'Food & Seafood',
      subtitle: 'Beachside ordering',
      badge: 'Express Delivery',
      price: 'From ₹80',
      rating: 4.9,
      reviews: 210,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/20 border-emerald-200/80',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
      icon: Utensils,
      phone: '+919876543212',
      description: 'Order authentic Malabar seafood, fresh tender coconut, ice creams, and beach snacks delivered to your spot.',
      features: ['Fresh local catch', 'Tender coconut delivery', 'Hygiene certified', 'Fast beach delivery'],
    },
    {
      id: 'water-sports',
      category: 'activities',
      title: 'Water Sports & ATV',
      subtitle: 'Parasailing & Jet Ski',
      badge: 'Trending',
      price: 'From ₹350/ride',
      rating: 4.7,
      reviews: 86,
      gradient: 'from-cyan-500/10 via-blue-500/5 to-cyan-500/20 border-cyan-200/80',
      iconBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/20',
      icon: Waves,
      phone: '+919876543213',
      description: 'Experience thrilling parasailing, Jet Ski rides, ATV beach sand drive, and speed boat tours with certified trainers.',
      features: ['Safety lifejackets included', 'Professional instructors', 'Photo & Video capture', 'Family packages'],
    },
    {
      id: 'beach-rentals',
      category: 'rentals',
      title: 'Beach Equipment',
      subtitle: 'Umbrellas & Chairs',
      badge: 'Instant Setup',
      price: 'From ₹100/hr',
      rating: 4.6,
      reviews: 52,
      gradient: 'from-rose-500/10 via-pink-500/5 to-rose-500/20 border-rose-200/80',
      iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-rose-500/20',
      icon: Umbrella,
      phone: '+919876543214',
      description: 'Rent comfortable sun loungers, beach umbrellas, volleyball sets, and camera tripod stands right on the shore.',
      features: ['Shade umbrella setup', 'Clean sunbeds', 'Sports gear rental', 'Hourly flexible rates'],
    },
    {
      id: 'guided-tours',
      category: 'transport',
      title: 'Guided Beach Tour',
      subtitle: 'Drive-in experience',
      badge: 'Exclusive',
      price: 'From ₹499/group',
      rating: 4.9,
      reviews: 73,
      gradient: 'from-sky-500/10 via-indigo-500/5 to-sky-500/20 border-sky-200/80',
      iconBg: 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-sky-500/20',
      icon: Compass,
      phone: '+919876543215',
      description: 'Explore Asia’s largest drive-in beach with local guides. Learn history, best sunset spots, and photography locations.',
      features: ['Drive-in safety briefing', 'Best sunset view points', 'Local history guide', 'Photo spots map'],
    },
  ];

  const filteredServices = servicesList.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  const handleDetectGPS = () => {
    setIsDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingGps(false);
          setPickupLocation('Muzhappilangad Beach Shore (GPS Live)');
        },
        () => {
          setIsDetectingGps(false);
          setPickupLocation('Muzhappilangad Drive-In Beach (Auto-detected)');
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingGps(false);
        setPickupLocation('Muzhappilangad Beach (Auto-detected)');
      }, 500);
    }
  };

  const handleOpenModal = (service) => {
    setActiveModal(service);
    setBookingSuccess(false);
    setFormData({ name: '', phone: '', date: '', notes: '' });
    setSelectedDestination(null);
    setDestSearch('');
    setVehicleType('auto');
    if (service.isRide) {
      handleDetectGPS();
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setBookingSuccess(false);
    setSelectedDestination(null);
    setDestSearch('');
  };

  const handleSelectDestination = (dest) => {
    setSelectedDestination(dest);
    setDestSearch(dest.name);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  const filtered10KmSpots = destSearch.trim()
    ? nearbyDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(destSearch.toLowerCase()) ||
          d.distance.toLowerCase().includes(destSearch.toLowerCase()) ||
          d.type.toLowerCase().includes(destSearch.toLowerCase())
      )
    : nearbyDestinations;

  const currentFare = selectedDestination
    ? vehicleType === 'auto'
      ? selectedDestination.autoFare
      : selectedDestination.taxiFare
    : 'From ₹50';

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-slate-50">
      <MobileHeader title={t('nav.services', 'Services')} showLanguage />

      <main className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 sm:px-5">
        {/* Banner Section */}
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-4 text-white shadow-lg shadow-blue-900/15">
          <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Muzhappilangad Beach Services</span>
            </div>
            <h1 className="mt-1 text-lg font-bold sm:text-xl">Everything for Your Beach Visit</h1>
            <p className="mt-0.5 text-xs text-blue-100/90">
              Book rides, stay at resorts, order fresh food & enjoy water sports directly.
            </p>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="relative mb-3.5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search auto, resort, food, water sports..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs sm:text-sm font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 2-COLUMN GRID LIST OF SERVICES */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pb-6">
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => handleOpenModal(service)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer border-gray-100 hover:border-blue-200"
              >
                {/* Top Row: Icon & Badge */}
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md ${service.iconBg}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-700">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {service.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-1">
                    {service.subtitle}
                  </p>
                </div>

                {/* Bottom Row: Rating & Price */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-gray-800">{service.rating}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
                    {service.price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="my-8 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-xs font-semibold text-gray-700">No services found</p>
            <p className="mt-0.5 text-[11px] text-gray-500">Try adjusting your search query or filter category.</p>
          </div>
        )}
      </main>

      {/* SERVICE & RIDE BOOKING MODAL (PORTALED INSIDE DEVICE FRAME) */}
      {activeModal && portalTarget && createPortal(
        <div
          className="absolute inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          style={{
            background: 'rgba(2, 6, 23, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl transition-all max-h-[90%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activeModal.iconBg}`}>
                  <activeModal.icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{activeModal.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {activeModal.rating} ({activeModal.reviews} reviews)
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-blue-600">{currentFare}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {bookingSuccess ? (
              <div className="my-6 text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="mt-3 text-base font-bold text-gray-900">Ride Booking Confirmed!</h3>
                <p className="mt-1 text-xs text-gray-600 px-4">
                  {selectedDestination
                    ? `Your ride from ${pickupLocation} to ${selectedDestination.name} is booked.`
                    : 'Our driver will contact you shortly to confirm pickup.'}
                </p>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      setBookingSuccess(false);
                      setSelectedDestination(null);
                    }}
                  >
                    New Booking
                  </Button>
                  <Button
                    className="w-full text-xs"
                    onClick={handleCloseModal}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {/* AUTO & TAXI RIDE WORKFLOW */}
                {activeModal.isRide ? (
                  <div className="space-y-3.5">
                    {/* FROM: Auto-detected Current Location */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                          <LocateFixed className={`h-3.5 w-3.5 text-blue-600 ${isDetectingGps ? 'animate-spin' : ''}`} />
                          Pickup Location (From)
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Auto-Detected
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{pickupLocation}</span>
                      </p>
                    </div>

                    {/* TO: Choose 10 KM Destination */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5 text-amber-600" />
                          Destination (To • Within 10 km)
                        </span>
                        {selectedDestination && (
                          <button
                            type="button"
                            onClick={() => setSelectedDestination(null)}
                            className="text-[10px] font-semibold text-blue-600 hover:underline"
                          >
                            Change
                          </button>
                        )}
                      </div>

                      {/* Search Destination Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={destSearch}
                          onChange={(e) => {
                            setDestSearch(e.target.value);
                            if (selectedDestination && selectedDestination.name !== e.target.value) {
                              setSelectedDestination(null);
                            }
                          }}
                          placeholder="Search spot around 10 km (e.g. Dharmadam, Thalassery)..."
                          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-8.5 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* 10 KM Destination Selection Cards (Around Current Location) */}
                      {!selectedDestination && (
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                            Spots Around Current Location (Within 10 km)
                          </p>
                          {filtered10KmSpots.map((dest) => (
                            <div
                              key={dest.id}
                              onClick={() => handleSelectDestination(dest)}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                  <MapPin className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 leading-snug">{dest.name}</p>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="font-semibold text-emerald-600">{dest.distance} away</span>
                                    <span>•</span>
                                    <span>{dest.time}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded text-[11px]">
                                  {vehicleType === 'auto' ? dest.autoFare : dest.taxiFare}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Selected Route Summary Banner */}
                      {selectedDestination && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                              <Route className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-emerald-950">{selectedDestination.name}</p>
                              <p className="text-[10.5px] font-semibold text-emerald-700">
                                {selectedDestination.distance} • ~{selectedDestination.time} drive
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">
                            {vehicleType === 'auto' ? selectedDestination.autoFare : selectedDestination.taxiFare}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setVehicleType('auto')}
                        className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition-all ${
                          vehicleType === 'auto'
                            ? 'border-2 border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Car className="h-4 w-4 text-amber-600" />
                        <span>Auto-Rickshaw</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleType('taxi')}
                        className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold transition-all ${
                          vehicleType === 'taxi'
                            ? 'border-2 border-blue-500 bg-blue-50 text-blue-900 shadow-xs'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Car className="h-4 w-4 text-blue-600" />
                        <span>Taxi / Cab (AC)</span>
                      </button>
                    </div>

                    {/* Quick Call Direct */}
                    <div className="flex items-center justify-between rounded-xl bg-blue-50/80 border border-blue-100 p-2.5">
                      <div>
                        <p className="text-xs font-bold text-blue-950">Direct Operator Dispatch</p>
                        <p className="text-[11px] text-blue-700">Call for instant driver assignment</p>
                      </div>
                      <a
                        href={`tel:${activeModal.phone}`}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Call Now</span>
                      </a>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleFormSubmit} className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <Button type="submit" className="w-full text-xs font-bold py-2.5">
                        {selectedDestination
                          ? `Confirm ${vehicleType === 'auto' ? 'Auto' : 'Taxi'} Booking (${vehicleType === 'auto' ? selectedDestination.autoFare : selectedDestination.taxiFare})`
                          : `Request ${vehicleType === 'auto' ? 'Auto' : 'Taxi'} Ride`}
                      </Button>
                    </form>
                  </div>
                ) : (
                  /* Standard Service Flow (Resort, Food, Sports, Rentals) */
                  <div className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">{activeModal.description}</p>

                    {/* Highlights */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Highlights</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {activeModal.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 rounded-lg p-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Call Direct */}
                    <div className="flex items-center justify-between rounded-xl bg-blue-50/80 border border-blue-100 p-3">
                      <div>
                        <p className="text-xs font-bold text-blue-950">Direct Operator Support</p>
                        <p className="text-[11px] text-blue-700">Call for instant booking & help</p>
                      </div>
                      <a
                        href={`tel:${activeModal.phone}`}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Call Now</span>
                      </a>
                    </div>

                    {/* Instant Request Form */}
                    <form onSubmit={handleFormSubmit} className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Request Booking</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Preferred Date / Time / Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <Button type="submit" className="w-full text-xs font-bold py-2.5">
                        Submit Booking Request
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        portalTarget
      )}

      <BottomNavigation items={userNav} />
    </div>
  );
}
