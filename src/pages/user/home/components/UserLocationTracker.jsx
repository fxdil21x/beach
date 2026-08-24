import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, Navigation } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useEmergency } from '../../../../context/EmergencyContext.jsx';
import axios from '../../../../api/axios.js';
import CommonModal from '../../../../components/common/CommonModal/index.js';

export default function UserLocationTracker() {
  const { user } = useAuth();
  const { socket } = useEmergency();
  const location = useLocation();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState('');

  const hasInteractedRef = useRef(false);
  const watchIdRef = useRef(null);
  const lastSocketCallRef = useRef(0);
  const lastPathnameRef = useRef(location.pathname);
  const lastPosRef = useRef(null);

  const isOnlyLoggedInUser = Boolean(user && user.role !== 'ADMIN' && user.role !== 'MASTER_ADMIN');
  const userKey = user?.id || user?._id;
  const lastUserIdRef = useRef(userKey);

  // Keep track of active user ID & reset interaction state on user login/logout
  useEffect(() => {
    hasInteractedRef.current = false;
    if (userKey) {
      lastUserIdRef.current = userKey;
    }
  }, [userKey]);

  // Listen for test-location-prompt event from admin test buttons
  useEffect(() => {
    const handleTestPrompt = () => {
      setLocationError('');
      hasInteractedRef.current = false;
      setShowPrompt(true);
    };
    window.addEventListener('test-location-prompt', handleTestPrompt);
    return () => window.removeEventListener('test-location-prompt', handleTestPrompt);
  }, []);

  // Main lifecycle: if already allowed in localStorage, start tracking silently without popup
  useEffect(() => {
    if (!isOnlyLoggedInUser || !userKey) {
      stopTracking();
      setShowPrompt(false);
      return;
    }

    const isAllowed = localStorage.getItem(`location_allowed_${userKey}`) === 'true';
    const isDeclined = sessionStorage.getItem(`location_declined_${userKey}`) === 'true';

    if (isAllowed) {
      // User has already granted permission previously - start tracking silently
      hasInteractedRef.current = true;
      setShowPrompt(false);
      startGeolocationWatch();
      return;
    }

    if (isDeclined || hasInteractedRef.current) {
      return;
    }

    // First time for this user: show popup after a brief delay
    const timer = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setShowPrompt(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isOnlyLoggedInUser, userKey]);

  // Teardown watch on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // Handle Page Visibility change (when web app is minimized or tab is in background)
  useEffect(() => {
    if (!isTracking) return;

    let bgIntervalId = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        bgIntervalId = setInterval(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => sendLocationData(pos, true),
              (err) => console.warn('[Geolocation] Background position fetch error:', err.message),
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          }
        }, 8000);
      } else {
        if (bgIntervalId) {
          clearInterval(bgIntervalId);
          bgIntervalId = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (bgIntervalId) {
        clearInterval(bgIntervalId);
      }
    };
  }, [isTracking]);

  // Calculate approximate distance in meters between two coordinates
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sendLocationData = (position, isNavigationAction = false) => {
    if (!user) return;
    const now = Date.now();
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const isNavigation = isNavigationAction || location.pathname !== lastPathnameRef.current;
    let hasMoved = false;

    if (lastPosRef.current) {
      const dist = getDistanceMeters(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng);
      if (dist >= 10) {
        hasMoved = true;
      }
    } else {
      hasMoved = true;
    }

    lastPosRef.current = { lat, lng };

    const payload = {
      userId: String(user.id || user._id),
      userName: user.name || user.fullName || 'Registered Resident',
      username: user.username || '',
      userPhone: user.phone || '',
      latitude: lat,
      longitude: lng,
      speed: position.coords.speed,
      heading: position.coords.heading,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString(),
    };

    // Store latest location in localStorage
    try {
      localStorage.setItem('user_last_location', JSON.stringify(payload));
      localStorage.setItem('user_location', JSON.stringify({ latitude: lat, longitude: lng, timestamp: payload.timestamp }));
      if (userKey) {
        localStorage.setItem(`user_location_${userKey}`, JSON.stringify(payload));
        localStorage.setItem(`location_allowed_${userKey}`, 'true');
      }
    } catch (e) {
      console.warn('[Geolocation] Could not save to localStorage:', e);
    }

    const timeSinceLastUpdate = now - lastSocketCallRef.current;
    if (isNavigation || hasMoved || timeSinceLastUpdate >= 10000) {
      lastSocketCallRef.current = now;
      lastPathnameRef.current = location.pathname;

      if (socket && socket.connected) {
        socket.emit('user:location-update', payload);
      }
      axios.post('/user/location', payload).catch(() => {});
    }
  };

  const startGeolocationWatch = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError('');
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Trigger initial position call
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendLocationData(position, true);
        setIsTracking(true);
      },
      (err) => {
        console.warn('[Geolocation] Initial position error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied in browser settings. Please allow location in your browser address bar.');
          setIsTracking(false);
        }
      },
      options
    );

    // Continuous location watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationData(position);
        setIsTracking(true);
      },
      (err) => {
        console.warn('[Geolocation] Watch error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied in browser settings.');
          setIsTracking(false);
        }
      },
      options
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    const targetUserId = user?.id || user?._id || lastUserIdRef.current;
    if (targetUserId) {
      if (socket && socket.connected) {
        socket.emit('user:stop-tracking', { userId: String(targetUserId) });
      }
      axios.post('/user/location/stop', { userId: String(targetUserId) }).catch(() => {});
    }
    setIsTracking(false);
  };

  const handleAllow = () => {
    hasInteractedRef.current = true;
    setShowPrompt(false);
    setLocationError('');
    if (userKey) {
      localStorage.setItem(`location_allowed_${userKey}`, 'true');
    }
    startGeolocationWatch();
  };

  const handleDecline = () => {
    hasInteractedRef.current = true;
    setShowPrompt(false);
    if (userKey) {
      sessionStorage.setItem(`location_declined_${userKey}`, 'true');
    }
    stopTracking();
  };

  // If user is not logged in as a registered user, render nothing
  if (!isOnlyLoggedInUser) {
    return null;
  }

  return (
    <>
      {/* Location Consent Modal using CommonModal */}
      <CommonModal
        isOpen={showPrompt}
        onClose={handleDecline}
        icon={MapPin}
        iconBg="bg-emerald-50 text-emerald-600 border border-emerald-100"
        title="Enable Live Location Sharing"
        subtitle="Beach Safety System has enabled live safety monitoring for registered visitors and residents at Muzhappilangad Beach."
        actionLabel={locationError ? '📍 Retry Location Access' : '📍 Allow Location'}
        onAction={handleAllow}
        actionBtnClass="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Not Now
            </button>
            <button
              type="button"
              onClick={handleAllow}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5" />
              {locationError ? 'Retry Location Access' : 'Allow Location'}
            </button>
          </div>
        }
      >
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Why share your location?</span>
          </div>
          <p className="text-emerald-700 leading-normal">
            Your live location helps safety officers locate you instantly on the Master Admin map during emergency SOS alerts or high-tide warnings.
          </p>
        </div>

        {locationError && (
          <div className="rounded-2xl bg-red-50/90 border border-red-200/80 p-4 text-xs text-red-700 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>Browser Location Access Blocked</span>
            </div>
            <p className="text-red-600 leading-relaxed">
              Your browser is blocking location requests. Click the lock/site icon 🔒 next to the address bar at the top, set <strong>Location</strong> to <strong>Allow</strong>, then click <strong>Retry</strong> below.
            </p>
          </div>
        )}
      </CommonModal>
    </>
  );
}
