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
  const lastPosRef = useRef(null);

  const isEnabled = Boolean(featureSettings.trackUserEnabled);
  const isOnlyLoggedInUser = Boolean(user && user.role !== 'ADMIN' && user.role !== 'MASTER_ADMIN');
  const userKey = user?.id || user?._id;
  const lastUserIdRef = useRef(userKey);

  // Listen for test-location-prompt event from admin test buttons
  useEffect(() => {
    const handleTestPrompt = () => {
      setLocationError('');
      setShowPrompt(true);
    };
    window.addEventListener('test-location-prompt', handleTestPrompt);
    return () => window.removeEventListener('test-location-prompt', handleTestPrompt);
  }, []);

  // Keep track of active user ID for clean logout socket disconnect
  useEffect(() => {
    if (userKey) {
      lastUserIdRef.current = userKey;
    }
  }, [userKey]);

  // Reset decline state on fresh user login
  useEffect(() => {
    if (userKey) {
      setHasDeclined(false);
    }
  }, [userKey]);

  // Automatically trigger location consent modal 1 second after user login when feature is enabled
  useEffect(() => {
    if (!isEnabled || !isOnlyLoggedInUser || hasDeclined) {
      stopTracking();
      setShowPrompt(false);
      return;
    }

    // If not already tracking, show the location access prompt modal after 1-second delay
    if (!isTracking) {
      setLocationError('');
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isEnabled, isOnlyLoggedInUser, userKey, hasDeclined, isTracking]);

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

    // Continuous location update over socket & REST API (on movement > 10m, navigation, or every 10s heartbeat)
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
      maximumAge: 0, // Forces hardware GPS sensor query for real-time accuracy
    };

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Trigger initial position call immediately (forces browser native GPS prompt)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendLocationData(position, true);
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
    setShowPrompt(false);
    setLocationError('');
    startGeolocationWatch();
  };

  const handleDecline = () => {
    setShowPrompt(false);
    setHasDeclined(true);
    stopTracking();
  };

  // If tracking feature is OFF or user is not logged in as a registered user, render nothing
  if (!isEnabled || !isOnlyLoggedInUser) {
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
