import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, X, Navigation } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useFeatureSettings } from '../../../../context/FeatureContext.jsx';
import { useEmergency } from '../../../../context/EmergencyContext.jsx';
import axios from '../../../../api/axios.js';
import CommonModal from '../../../../components/common/CommonModal/index.js';

export default function UserLocationTracker() {
  const { user } = useAuth();
  const { featureSettings } = useFeatureSettings();
  const { socket } = useEmergency();
  const location = useLocation();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);
  const [locationError, setLocationError] = useState('');
  const watchIdRef = useRef(null);
  const lastSocketCallRef = useRef(0);
  const lastPathnameRef = useRef(location.pathname);

  const isEnabled = Boolean(featureSettings.trackUserEnabled);
  const isRegisteredUser = Boolean(user && user.role !== 'ADMIN' && user.role !== 'MASTER_ADMIN');
  const userKey = user?.id || user?._id;

  // Reset decline state on fresh user login
  useEffect(() => {
    setHasDeclined(false);
  }, [userKey]);

  // Automatically trigger location consent modal on user login, navigation, or when feature is enabled (with 1s delay)
  useEffect(() => {
    if (!isEnabled || !isRegisteredUser || hasDeclined) {
      stopTracking();
      setShowPrompt(false);
      return;
    }

    const userIdKey = user?.id || user?._id || 'current_user';
    const storedConsent = sessionStorage.getItem(`location_sharing_consent_${userIdKey}`);

    // If user has already allowed location sharing in this session, resume tracking automatically without showing modal again
    if (storedConsent === 'allowed') {
      setShowPrompt(false);
      if (!isTracking) {
        startGeolocationWatch();
      }
      return;
    }

    // Show prompt modal after 1-second delay for fresh consent
    if (!isTracking) {
      setLocationError('');
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isEnabled, isRegisteredUser, user, location.pathname, isTracking, hasDeclined]);

  // Teardown watch on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

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

    // Zero traffic if idle (no movement > 10m and no menu action)
    if (!hasMoved && !isNavigation) {
      return;
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

    // 100% FREE WebSocket update for live tracking (throttled to 3s)
    if (socket && socket.connected && now - lastSocketCallRef.current >= 3000) {
      lastSocketCallRef.current = now;
      socket.emit('user:location-update', payload);
    }

    // REST HTTP API POST call ONLY on menu navigation actions
    if (isNavigation) {
      lastPathnameRef.current = location.pathname;
      axios.post('/user/location', payload).catch(() => {});
    }
  };

  const startGeolocationWatch = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError('');
    const userIdKey = user?.id || user?._id || 'current_user';
    sessionStorage.setItem(`location_sharing_consent_${userIdKey}`, 'allowed');

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    };

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Trigger initial position call immediately (forces browser native GPS prompt)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendLocationData(position);
        setIsTracking(true);
        setShowPrompt(false);
      },
      (err) => {
        console.warn('[Geolocation] Initial position error:', err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied in browser settings. Please allow location in your browser address bar.');
          setIsTracking(false);
          setShowPrompt(true);
        }
      },
      options
    );

    // Continuous location watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationData(position);
        setIsTracking(true);
        setShowPrompt(false);
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
    if (socket && socket.connected && user) {
      socket.emit('user:stop-tracking', { userId: String(user.id || user._id) });
    }
    setIsTracking(false);
  };

  const handleAllow = () => {
    setLocationError('');
    startGeolocationWatch();
  };

  const handleDecline = () => {
    setShowPrompt(false);
    setHasDeclined(true);
    const userIdKey = user?.id || user?._id || 'current_user';
    sessionStorage.setItem(`location_sharing_consent_${userIdKey}`, 'declined');
    stopTracking();
  };

  // If tracking feature is OFF or user not logged in, render nothing
  if (!isEnabled || !isRegisteredUser) {
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
