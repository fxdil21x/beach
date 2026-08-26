import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, Navigation } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useEmergency } from '../../../../context/EmergencyContext.jsx';
import axios from '../../../../api/axios.js';
import CommonModal from '../../../../components/common/CommonModal/index.js';

const LOCATION_PERMISSION_WINDOW = 30 * 60 * 1000; // 30 minutes in ms

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

  // Helper to check if the 30-minute location permission is still valid
  const isPermissionValid = (userId) => {
    if (!userId) return false;
    const isAllowed = localStorage.getItem(`location_allowed_${userId}`) === 'true';
    const timestampStr = localStorage.getItem(`location_allowed_time_${userId}`);
    if (!isAllowed || !timestampStr) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    return Date.now() - timestamp < LOCATION_PERMISSION_WINDOW;
  };

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

  // Send location payload once (WebSocket primary, HTTP fallback)
  const sendLocationPayload = (payload) => {
    if (!user) return;
    const now = Date.now();
    lastSocketCallRef.current = now;
    lastPathnameRef.current = location.pathname;

    // Cache locally & refresh activity timestamp if permission is active
    try {
      localStorage.setItem('user_last_location', JSON.stringify(payload));
      localStorage.setItem('user_location', JSON.stringify({ latitude: payload.latitude, longitude: payload.longitude, timestamp: payload.timestamp }));
      if (userKey && localStorage.getItem(`location_allowed_${userKey}`) === 'true') {
        localStorage.setItem(`user_location_${userKey}`, JSON.stringify(payload));
        localStorage.setItem(`location_allowed_${userKey}`, 'true');
        localStorage.setItem(`location_allowed_time_${userKey}`, now.toString());
      }
    } catch (e) {
      console.warn('[Geolocation] LocalStorage save error:', e);
    }

    // Send update: WebSocket preferred, REST API fallback
    if (socket && socket.connected) {
      socket.emit('user:location-update', payload);
    } else {
      axios.post('/user/location', payload).catch(() => {});
    }
  };

  const fetchAndSendCurrentLocation = () => {
    if (!user || !userKey) return;
    if (!isPermissionValid(userKey)) return;

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    // Try reading cached location first for instant update
    try {
      const cached = localStorage.getItem(`user_location_${userKey}`) || localStorage.getItem('user_last_location');
      if (cached) {
        const parsed = JSON.parse(cached);
        sendLocationPayload({
          ...parsed,
          userId: String(user.id || user._id),
          userName: user.name || user.fullName || 'Registered Resident',
          username: user.username || '',
          userPhone: user.phone || '',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[Geolocation] Cached location read error:', e);
    }

    // Get single fresh GPS fix from device
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsTracking(true);
        const payload = {
          userId: String(user.id || user._id),
          userName: user.name || user.fullName || 'Registered Resident',
          username: user.username || '',
          userPhone: user.phone || '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        sendLocationPayload(payload);
      },
      (err) => {
        console.warn('[Geolocation] Position fetch error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied in browser settings.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  // Main lifecycle: if already allowed in localStorage within 30 minutes, sync once silently
  useEffect(() => {
    if (!isOnlyLoggedInUser || !userKey) {
      stopTracking();
      setShowPrompt(false);
      return;
    }

    const hasValidPermission = isPermissionValid(userKey);
    const isDeclined = sessionStorage.getItem(`location_declined_${userKey}`) === 'true';

    if (hasValidPermission) {
      // User has active 30-minute valid permission - sync location ONCE silently
      hasInteractedRef.current = true;
      setShowPrompt(false);
      fetchAndSendCurrentLocation();
      return;
    }

    // Permission expired (> 30 mins) or not granted yet: reset permission state and show popup
    localStorage.removeItem(`location_allowed_${userKey}`);
    localStorage.removeItem(`location_allowed_time_${userKey}`);

    if (isDeclined || hasInteractedRef.current) {
      return;
    }

    // Show popup after a brief delay so user can confirm location access
    const timer = setTimeout(() => {
      if (!hasInteractedRef.current) {
        setShowPrompt(true);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isOnlyLoggedInUser, userKey]);

  // Sync location ONLY when Tab / Route changes (Home, My Pass, Services, Reports, Profile, etc.)
  useEffect(() => {
    if (!isOnlyLoggedInUser || !userKey) return;
    if (isPermissionValid(userKey)) {
      fetchAndSendCurrentLocation();
    }
  }, [location.pathname]);

  const stopTracking = () => {
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
      localStorage.setItem(`location_allowed_time_${userKey}`, Date.now().toString());
    }
    fetchAndSendCurrentLocation();
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
