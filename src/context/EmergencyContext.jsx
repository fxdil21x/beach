import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';
import {
  createEmergencyAlarmSound,
  playUserConfirmationSound,
} from '../utils/soundUtils.js';
import {
  triggerUserFeedbackVibration,
  startEmergencyVibrationLoop,
  stopEmergencyVibration,
} from '../utils/vibrationUtils.js';

const EmergencyContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : 'https://beachbackend.vercel.app';

export function EmergencyProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeEmergencies, setActiveEmergencies] = useState({});
  const [userEmergencyState, setUserEmergencyState] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Map to hold audio objects per emergencyId: emergencyId -> audioObject
  const audioMapRef = useRef(new Map());

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'MASTER_ADMIN');

  // Connect socket
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      path: '/api/socket.io',
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 3,
      timeout: 5000,
      transports: ['websocket', 'polling'],
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('[EmergencyContext] Socket connected:', s.id);
      if (isAdmin) {
        s.emit('join:admin');
      }
      if (user?.id || user?._id) {
        s.emit('join:user', user.id || user._id);
      }
    });

    s.on('connect_error', (err) => {
      console.warn('[EmergencyContext] Socket connection unavailable (serverless / 404), stopping socket retries:', err.message);
      s.disconnect();
    });

    return () => {
      s.disconnect();
    };
  }, [user, isAdmin]);

  // Handle emergency audio for a specific emergencyId
  const startAlarmSound = useCallback((emergencyId) => {
    let alarmAudio = audioMapRef.current.get(emergencyId);
    if (!alarmAudio) {
      alarmAudio = createEmergencyAlarmSound();
      alarmAudio.loop = true;
      audioMapRef.current.set(emergencyId, alarmAudio);
    }

    if (!alarmAudio.isPlaying) {
      alarmAudio
        .play()
        .then(() => {
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn(`[EmergencyContext] Autoplay blocked for ${emergencyId}, will retry:`, err);
          setAutoplayBlocked(true);
        });
    }
  }, []);

  const stopAlarmSound = useCallback((emergencyId) => {
    const alarmAudio = audioMapRef.current.get(emergencyId);
    if (alarmAudio) {
      try {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
      } catch (e) {
        console.warn('Error pausing audio:', e);
      }
      audioMapRef.current.delete(emergencyId);
    }
  }, []);

  const stopAllAlarmSounds = useCallback(() => {
    audioMapRef.current.forEach((alarmAudio) => {
      try {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
    });
    audioMapRef.current.clear();
  }, []);

  // Admin Polling Fallback (ensures Vercel / serverless deployments fetch & sync active pending emergencies)
  const pollActiveEmergencies = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await axios.get('/emergency/active');
      const list = data.data?.emergencies || [];

      const currentPendingIds = new Set(list.map((e) => e.emergencyId));
      const emgMap = {};

      list.forEach((item) => {
        emgMap[item.emergencyId] = item;
        startAlarmSound(item.emergencyId);
      });

      // Stop sounds for emergencies that were claimed/resolved and are no longer pending
      audioMapRef.current.forEach((_audioObj, id) => {
        if (!currentPendingIds.has(id)) {
          stopAlarmSound(id);
        }
      });

      setActiveEmergencies(emgMap);

      if (list.length > 0) {
        startEmergencyVibrationLoop();
      } else {
        stopEmergencyVibration();
      }
    } catch {
      // Ignore polling errors
    }
  }, [isAdmin, startAlarmSound, stopAlarmSound]);

  useEffect(() => {
    if (!isAdmin) return;
    pollActiveEmergencies();
    const interval = setInterval(pollActiveEmergencies, 8000);
    return () => clearInterval(interval);
  }, [isAdmin, pollActiveEmergencies]);

  // Listen to emergency socket events for Admin
  useEffect(() => {
    if (!socket || !isAdmin) return;

    // Receive active list on connect
    const handleActiveList = (list) => {
      const emgMap = {};
      list.forEach((item) => {
        emgMap[item.emergencyId] = item;
        startAlarmSound(item.emergencyId);
      });
      setActiveEmergencies(emgMap);
      if (list.length > 0) {
        startEmergencyVibrationLoop();
      }
    };

    // Receive emergency:new
    const handleEmergencyNew = (emergencyData) => {
      console.log('[EmergencyContext] emergency:new received:', emergencyData);
      const { emergencyId } = emergencyData;

      setActiveEmergencies((prev) => ({
        ...prev,
        [emergencyId]: emergencyData,
      }));

      // Start sound & vibration immediately
      startAlarmSound(emergencyId);
      startEmergencyVibrationLoop();
    };

    // Receive emergency:claimed
    const handleEmergencyClaimed = (claimedData) => {
      console.log('[EmergencyContext] emergency:claimed received:', claimedData);
      const { emergencyId } = claimedData;

      // Stop only the sound related to that specific emergencyId immediately
      stopAlarmSound(emergencyId);

      setActiveEmergencies((prev) => {
        const next = { ...prev };
        delete next[emergencyId];

        // If no more active emergencies remain, stop vibration immediately
        if (Object.keys(next).length === 0) {
          stopEmergencyVibration();
        }
        return next;
      });
    };

    socket.on('emergency:active-list', handleActiveList);
    socket.on('emergency:new', handleEmergencyNew);
    socket.on('emergency:claimed', handleEmergencyClaimed);

    return () => {
      socket.off('emergency:active-list', handleActiveList);
      socket.off('emergency:new', handleEmergencyNew);
      socket.off('emergency:claimed', handleEmergencyClaimed);
    };
  }, [socket, isAdmin, startAlarmSound, stopAlarmSound]);

  // Clean up sounds & vibration on unmount
  useEffect(() => {
    return () => {
      stopAllAlarmSounds();
      stopEmergencyVibration();
    };
  }, [stopAllAlarmSounds]);

  // User Action: Trigger Emergency
  const triggerEmergency = async (locationDetails = '') => {
    // 1. Give short 200ms vibration feedback
    triggerUserFeedbackVibration();

    // 2. Play small confirmation sound
    playUserConfirmationSound();

    const emergencyId = `emg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      emergencyId,
      userId: user?.id || user?._id || 'ANONYMOUS',
      userName: user?.name || user?.phone || user?.username || 'Beach Visitor',
      userPhone: user?.phone || user?.username || '',
      location: locationDetails || 'Muzhappilangad Beach Area',
      timestamp: new Date().toISOString(),
    };

    // 3. Set local feedback state
    setUserEmergencyState({
      status: 'PENDING',
      message: 'Emergency alert sent. Waiting for an admin.',
      emergencyId,
    });

    // 4. Emit socket event if connected
    if (socket && socket.connected) {
      socket.emit('emergency:trigger', payload);
    }

    // Fallback REST call
    try {
      const token = localStorage.getItem('beach_app_token');
      await fetch(`${SOCKET_SERVER_URL}/api/emergency/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // socket handled it
    }

    return 'Emergency alert sent. Waiting for an admin.';
  };

  // Admin Action: Claim / Connect Emergency
  const claimEmergency = async (emergencyId) => {
    // Touch feedback vibration for admin
    triggerUserFeedbackVibration();

    // Stop sound & vibration locally for this emergency immediately
    stopAlarmSound(emergencyId);

    setActiveEmergencies((prev) => {
      const next = { ...prev };
      delete next[emergencyId];
      if (Object.keys(next).length === 0) {
        stopEmergencyVibration();
      }
      return next;
    });

    const adminInfo = {
      adminId: user?.id || user?._id || 'ADMIN',
      adminName: user?.name || 'Gate Admin',
    };

    if (socket && socket.connected) {
      socket.emit('emergency:claim', {
        emergencyId,
        ...adminInfo,
      });
    }

    try {
      const token = localStorage.getItem('beach_app_token');
      await fetch(`${SOCKET_SERVER_URL}/api/emergency/claim/${emergencyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // socket handled it
    }
  };

  // User Action: Cancel / Clear Emergency
  const cancelUserEmergency = async (emergencyId) => {
    const targetId = emergencyId || userEmergencyState?.emergencyId;

    // Reset user emergency state immediately
    setUserEmergencyState(null);

    if (!targetId) return;

    // Emit socket cancel event
    if (socket && socket.connected) {
      socket.emit('emergency:cancel', { emergencyId: targetId });
    }

    // Fallback REST cancel request
    try {
      const token = localStorage.getItem('beach_app_token');
      await fetch(`${SOCKET_SERVER_URL}/api/emergency/cancel/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // socket handled it
    }
  };

  // Manually unlock audio if autoplay was blocked
  const retryAudioUnlock = () => {
    audioMapRef.current.forEach((alarmAudio) => {
      alarmAudio.play().then(() => setAutoplayBlocked(false)).catch(() => {});
    });
  };

  return (
    <EmergencyContext.Provider
      value={{
        socket,
        activeEmergencies,
        userEmergencyState,
        autoplayBlocked,
        triggerEmergency,
        claimEmergency,
        cancelUserEmergency,
        retryAudioUnlock,
        setUserEmergencyState,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
