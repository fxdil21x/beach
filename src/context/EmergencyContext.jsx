import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios, { getSocketServerUrl } from '../api/axios.js';
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

// ── WebRTC helpers ──────────────────────────────────────────────────────────
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

function createPeerConnection(onIceCandidate, onRemoteStream) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  pc.onicecandidate = (e) => { if (e.candidate) onIceCandidate(e.candidate); };
  pc.ontrack = (e) => { if (e.streams[0]) onRemoteStream(e.streams[0]); };
  return pc;
}

const EmergencyContext = createContext(null);

const SOCKET_SERVER_URL = getSocketServerUrl();

export function EmergencyProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeEmergencies, setActiveEmergencies] = useState({});
  const [userEmergencyState, setUserEmergencyState] = useState(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // ── Voice call state ──────────────────────────────────────────────────────
  // callState: null | { status: 'calling'|'connected'|'incoming'|'ended', emergencyId, peerName, remoteSocketId }
  const [callState, setCallState] = useState(null);
  const peerRef        = useRef(null);   // RTCPeerConnection
  const localStreamRef = useRef(null);   // MediaStream (mic)
  const remoteAudioRef = useRef(null);   // <audio> element for remote stream
  const remoteSocketIdRef = useRef(null); // socket id of the other party

  // Map to hold audio objects per emergencyId: emergencyId -> audioObject
  const audioMapRef = useRef(new Map());

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'MASTER_ADMIN');

  // Connect socket
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      path: '/api/socket.io',
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('[EmergencyContext] Socket connected:', s.id);
      if (isAdmin) {
        s.emit('join:admin');
      }
      const uid = user?.id || user?._id;
      if (uid) {
        s.emit('join:user', uid);
      }
      if (userEmergencyState?.emergencyId) {
        s.emit('join:emergency', userEmergencyState.emergencyId);
      }
    });

    s.on('connect_error', (err) => {
      console.warn('[EmergencyContext] Socket connection issue:', err.message);
    });

    return () => {
      s.disconnect();
    };
  }, [user, isAdmin]);

  // Ensure rooms are joined whenever user or emergency state changes
  useEffect(() => {
    if (!socket || !socket.connected) return;
    if (isAdmin) {
      socket.emit('join:admin');
    }
    const uid = user?.id || user?._id;
    if (uid) {
      socket.emit('join:user', uid);
    }
    if (userEmergencyState?.emergencyId) {
      socket.emit('join:emergency', userEmergencyState.emergencyId);
    }
  }, [socket, user, isAdmin, userEmergencyState?.emergencyId]);

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
  }, [isAdmin, pollActiveEmergencies]);

  // Listen to emergency socket events for Admin
  useEffect(() => {
    if (!socket || !isAdmin) return;

    // Receive active emergencies list on join
    const handleActiveList = (list) => {
      console.log('[EmergencyContext] emergency:active-list received:', list);
      const emgMap = {};
      const seenUsers = new Set();
      list.forEach((item) => {
        const userKey = item.userId && item.userId !== 'ANONYMOUS' ? `user_${item.userId}` : `emg_${item.emergencyId}`;
        if (!seenUsers.has(userKey)) {
          seenUsers.add(userKey);
          emgMap[item.emergencyId] = item;
          startAlarmSound(item.emergencyId);
        }
      });
      setActiveEmergencies(emgMap);
      if (Object.keys(emgMap).length > 0) {
        startEmergencyVibrationLoop();
      }
    };

    // Receive emergency:new
    const handleEmergencyNew = (emergencyData) => {
      console.log('[EmergencyContext] emergency:new received:', emergencyData);
      const { emergencyId, userId } = emergencyData;

      setActiveEmergencies((prev) => {
        const next = { ...prev };
        // Remove any previous emergency from the same user so only 1 appears
        if (userId && userId !== 'ANONYMOUS') {
          for (const [id, emg] of Object.entries(next)) {
            if (emg.userId === userId && id !== emergencyId) {
              delete next[id];
              stopAlarmSound(id);
            }
          }
        }
        next[emergencyId] = emergencyData;
        return next;
      });

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

    // Receive emergency:status-update (e.g. claimed by officer)
    const handleStatusUpdate = ({ emergencyId, status, claimedBy }) => {
      console.log('[EmergencyContext] emergency:status-update:', status, 'by', claimedBy);
      setUserEmergencyState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status,
          claimedBy: claimedBy || 'Gate Officer',
          message: status === 'CLAIMED' ? `Officer Connected (${claimedBy || 'Admin'})` : prev.message,
        };
      });
    };

    // Receive emergency:cancelled
    const handleEmergencyCancelled = ({ emergencyId }) => {
      console.log('[EmergencyContext] emergency:cancelled:', emergencyId);
      setUserEmergencyState((prev) => {
        if (prev?.emergencyId === emergencyId) return null;
        return prev;
      });
    };

    socket.on('emergency:active-list', handleActiveList);
    socket.on('emergency:new', handleEmergencyNew);
    socket.on('emergency:claimed', handleEmergencyClaimed);
    socket.on('emergency:status-update', handleStatusUpdate);
    socket.on('emergency:cancelled', handleEmergencyCancelled);

    return () => {
      socket.off('emergency:active-list', handleActiveList);
      socket.off('emergency:new', handleEmergencyNew);
      socket.off('emergency:claimed', handleEmergencyClaimed);
      socket.off('emergency:status-update', handleStatusUpdate);
      socket.off('emergency:cancelled', handleEmergencyCancelled);
    };
  }, [socket, isAdmin, startAlarmSound, stopAlarmSound]);

  // Clean up sounds & vibration on unmount
  useEffect(() => {
    return () => {
      stopAllAlarmSounds();
      stopEmergencyVibration();
    };
  }, [stopAllAlarmSounds]);

  // ── WebRTC helpers ────────────────────────────────────────────────────────

  /** Tear down the current peer connection cleanly */
  const closePeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    remoteSocketIdRef.current = null;
  }, []);

  /** Play incoming remote audio stream */
  const attachRemoteStream = useCallback((stream) => {
    if (!remoteAudioRef.current) {
      const audio = new Audio();
      audio.autoplay = true;
      remoteAudioRef.current = audio;
    }
    remoteAudioRef.current.srcObject = stream;
    remoteAudioRef.current.play().catch(() => {});
    setCallState((prev) => prev ? { ...prev, status: 'connected' } : prev);
  }, []);

  /** Admin: initiate WebRTC call to a user */
  const startCall = useCallback(async (emergencyId, userId, peerName = 'User') => {
    if (!socket || peerRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const pc = createPeerConnection(
        (candidate) => {
          if (socket.connected) {
            socket.emit('call:ice-candidate', {
              targetSocketId: remoteSocketIdRef.current,
              emergencyId,
              candidate,
            });
          }
        },
        attachRemoteStream,
      );
      peerRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setCallState({ status: 'calling', emergencyId, peerName, remoteSocketId: null });

      socket.emit('call:offer', {
        emergencyId,
        userId,
        sdp: pc.localDescription,
        adminId: user?.id || user?._id,
        adminName: user?.name || 'Gate Admin',
      });
    } catch (err) {
      console.error('[Voice] startCall error:', err);
      closePeer();
      setCallState({ status: 'ended', emergencyId, peerName, error: err.message });
    }
  }, [socket, user, attachRemoteStream, closePeer]);

  /** End call from either side */
  const endCall = useCallback((emergencyId) => {
    if (socket?.connected) {
      socket.emit('call:end', {
        targetSocketId: remoteSocketIdRef.current,
        emergencyId,
      });
    }
    closePeer();
    setCallState(null);
  }, [socket, closePeer]);

  /** Toggle local microphone mute */
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
  }, []);

  /** Read current mute state */
  const isMuted = useCallback(() => {
    if (!localStreamRef.current) return false;
    return localStreamRef.current.getAudioTracks().some((t) => !t.enabled);
  }, []);

  // ── Socket listeners: WebRTC signaling ───────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Admin receives answer from user
    const handleCallAnswered = async ({ emergencyId, sdp, userSocketId }) => {
      console.log('[Voice] call:answered received from user socket:', userSocketId);
      if (userSocketId) {
        remoteSocketIdRef.current = userSocketId;
      }
      const pc = peerRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        setCallState((prev) => prev ? { ...prev, status: 'connected', remoteSocketId: userSocketId } : prev);
      } catch (err) {
        console.error('[Voice] setRemoteDescription (answer) error:', err);
      }
    };

    // User receives call offer from admin — auto-answer
    const handleCallIncoming = async ({ emergencyId, adminId, adminName, sdp, adminSocketId }) => {
      console.log('[Voice] call:incoming from admin', adminName, 'socket:', adminSocketId);
      if (peerRef.current) return; // already in a call

      remoteSocketIdRef.current = adminSocketId;
      setCallState({ status: 'incoming', emergencyId, peerName: adminName || 'Gate Officer', remoteSocketId: adminSocketId });

      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = stream;
        } catch (mediaErr) {
          console.warn('[Voice] Mic access pending or denied, continuing connection:', mediaErr);
        }

        const pc = createPeerConnection(
          (candidate) => {
            if (socket.connected) {
              socket.emit('call:ice-candidate', {
                targetSocketId: adminSocketId,
                emergencyId,
                candidate,
              });
            }
          },
          attachRemoteStream,
        );
        peerRef.current = pc;

        if (stream) {
          stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        }

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('call:answer', {
          emergencyId,
          sdp: pc.localDescription,
          adminSocketId,
        });

        setCallState({
          status: 'connected',
          emergencyId,
          peerName: adminName || 'Gate Officer',
          remoteSocketId: adminSocketId,
        });
      } catch (err) {
        console.error('[Voice] auto-answer error:', err);
        closePeer();
        setCallState({ status: 'ended', emergencyId, peerName: adminName, error: err.message });
      }
    };

    // ICE candidate received
    const handleIceCandidate = async ({ candidate, fromSocketId }) => {
      const pc = peerRef.current;
      if (!pc || !candidate) return;
      if (!remoteSocketIdRef.current && fromSocketId) remoteSocketIdRef.current = fromSocketId;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[Voice] addIceCandidate error:', err);
      }
    };

    // Remote party ended the call
    const handleCallEnded = ({ emergencyId }) => {
      console.log('[Voice] call:ended received for', emergencyId);
      closePeer();
      setCallState(null);
    };

    socket.on('call:answered',      handleCallAnswered);
    socket.on('call:incoming',      handleCallIncoming);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:ended',         handleCallEnded);

    return () => {
      socket.off('call:answered',      handleCallAnswered);
      socket.off('call:incoming',      handleCallIncoming);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:ended',         handleCallEnded);
    };
  }, [socket, attachRemoteStream, closePeer]);

  // Cleanup on unmount
  useEffect(() => () => closePeer(), [closePeer]);

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

    // 4. Emit socket event if connected, otherwise fallback to REST
    if (socket && socket.connected) {
      socket.emit('join:emergency', emergencyId);
      socket.emit('emergency:trigger', payload);
    } else {
      try {
        await axios.post('/emergency/trigger', payload);
      } catch {
        // ignore
      }
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
      await axios.post(`/emergency/claim/${emergencyId}`);
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
      await axios.post(`/emergency/cancel/${targetId}`);
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
        // Voice call
        callState,
        startCall,
        endCall,
        toggleMute,
        isMuted,
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
