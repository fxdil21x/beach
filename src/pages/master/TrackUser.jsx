import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, UserCheck, ShieldAlert, Search, RefreshCw, Smartphone, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEmergency } from '../../context/EmergencyContext.jsx';
import { useFeatureSettings } from '../../context/FeatureContext.jsx';

// Default Muzhappilangad Beach Coordinates
const DEFAULT_CENTER = [11.7915, 75.4524];

export default function MasterTrackUser() {
  const { socket } = useEmergency();
  const { featureSettings } = useFeatureSettings();
  const [users, setUsers] = useState(new Map());
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());

  const isEnabled = Boolean(featureSettings.trackUserEnabled);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Join tracking room & listen to location events
  useEffect(() => {
    if (!socket || !isEnabled) return;

    socket.emit('join:track-users');

    const handleInitialUsers = (userList) => {
      const newMap = new Map();
      userList.forEach((u) => {
        if (u.userId) newMap.set(u.userId, u);
      });
      setUsers(newMap);
    };

    const handleUserUpdate = (userData) => {
      if (!userData.userId) return;
      setUsers((prev) => {
        const next = new Map(prev);
        next.set(userData.userId, userData);
        return next;
      });
    };

    const handleUserStopped = ({ userId }) => {
      if (!userId) return;
      setUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('location:initial-users', handleInitialUsers);
    socket.on('location:user-update', handleUserUpdate);
    socket.on('location:user-stopped', handleUserStopped);

    return () => {
      socket.off('location:initial-users', handleInitialUsers);
      socket.off('location:user-update', handleUserUpdate);
      socket.off('location:user-stopped', handleUserStopped);
    };
  }, [socket, isEnabled]);

  // Update map markers whenever users state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = markersRef.current;
    const activeUserIds = new Set(users.keys());

    // Remove obsolete markers
    currentMarkers.forEach((marker, userId) => {
      if (!activeUserIds.has(userId)) {
        map.removeLayer(marker);
        currentMarkers.delete(userId);
      }
    });

    // Create / Update markers for active users
    users.forEach((user, userId) => {
      const lat = Number(user.latitude);
      const lng = Number(user.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const customIcon = L.divIcon({
        className: 'custom-live-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex h-4 w-4 rounded-full bg-red-600 border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
            ${user.userName || 'Registered User'}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${user.username ? `@${user.username}` : ''} ${user.userPhone ? `• ${user.userPhone}` : ''}
          </div>
          <div style="font-size: 11px; background-color: #f1f5f9; padding: 6px; rounded: 6px; color: #334155;">
            <div><strong>Lat/Lng:</strong> ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
            ${user.speed != null ? `<div><strong>Speed:</strong> ${(user.speed * 3.6).toFixed(1)} km/h</div>` : ''}
            <div><strong>Last Seen:</strong> ${new Date(user.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      `;

      if (currentMarkers.has(userId)) {
        const marker = currentMarkers.get(userId);
        marker.setLatLng([lat, lng]);
        marker.setPopupContent(popupContent);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedUser(user));
        currentMarkers.set(userId, marker);
      }
    });
  }, [users]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const map = mapInstanceRef.current;
    if (map && user.latitude && user.longitude) {
      map.flyTo([Number(user.latitude), Number(user.longitude)], 16, {
        duration: 1.2,
      });
      const marker = markersRef.current.get(user.userId);
      if (marker) marker.openPopup();
    }
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (users.size > 0) {
      const bounds = L.latLngBounds(
        Array.from(users.values()).map((u) => [Number(u.latitude), Number(u.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.flyTo(DEFAULT_CENTER, 14);
    }
  };

  const filteredUsers = Array.from(users.values()).filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.userName && u.userName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.userPhone && u.userPhone.includes(q))
    );
  });

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            Track User — Live Location Sharing Map
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time GPS tracking of registered users currently sharing their location.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-bold text-white">{users.size}</span>
            <span>Live Dot{users.size === 1 ? '' : 's'}</span>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs px-3.5 py-2 transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recenter Map
          </button>
        </div>
      </div>

      {!isEnabled && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-300 text-sm font-semibold shrink-0">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
          <span>
            User Location Tracking is currently <strong>DISABLED</strong> in Feature Controls. Toggle it ON in Master Admin → Feature Controls to allow registered user location sharing.
          </span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Map Container */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl relative min-h-[350px]">
          <div ref={mapRef} className="w-full h-full z-0" />
          {users.size === 0 && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 shadow-xl flex items-center gap-2">
              <Navigation className="h-4 w-4 text-orange-400 animate-pulse" />
              <span>Waiting for active user location streams...</span>
            </div>
          )}
        </div>

        {/* Live Users Sidebar */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col min-h-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              Tracked Users ({filteredUsers.length})
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* User List Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs space-y-2">
                <Smartphone className="h-8 w-8 mx-auto text-zinc-600 opacity-60" />
                <p>No live tracked users right now.</p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?.userId === u.userId;
                return (
                  <div
                    key={u.userId}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/50 text-white'
                        : 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate text-white">
                            {u.userName || 'Registered User'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-extrabold text-red-400 border border-red-500/30">
                            🔴 LIVE
                          </span>
                        </div>
                        {u.username && (
                          <div className="text-[11px] text-zinc-400 truncate">@{u.username}</div>
                        )}
                        {u.userPhone && (
                          <div className="text-[11px] text-zinc-400 truncate">{u.userPhone}</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                      <span className="font-mono text-emerald-400">
                        {Number(u.latitude).toFixed(4)}, {Number(u.longitude).toFixed(4)}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
