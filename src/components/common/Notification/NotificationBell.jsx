import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import NotificationModal from './NotificationModal.jsx';
import { getPublicAnnouncements } from '../../../api/announcementApi.js';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function NotificationBell({ targetRole = 'user' }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const userId = user?.id || user?._id;

  const fetchAnnouncements = useCallback(async () => {
    if (!userId) {
      setAnnouncements([]);
      setHasUnread(false);
      return;
    }
    try {
      const { data } = await getPublicAnnouncements(targetRole);
      const list = data.data?.announcements || [];
      setAnnouncements(list);

      const storageKey = `last_seen_announcement_${targetRole}`;
      const lastSeen = localStorage.getItem(storageKey);
      if (list.length > 0) {
        const latestTime = new Date(list[0].createdAt).getTime();
        if (!lastSeen || latestTime > parseInt(lastSeen, 10)) {
          setHasUnread(true);
        } else {
          setHasUnread(false);
        }
      } else {
        setHasUnread(false);
      }
    } catch {
      setAnnouncements([]);
      setHasUnread(false);
    }
  }, [userId, targetRole]);

  useEffect(() => {
    if (userId) {
      fetchAnnouncements();
    }
  }, [userId, targetRole, fetchAnnouncements]);

  if (!user) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    const storageKey = `last_seen_announcement_${targetRole}`;
    localStorage.setItem(storageKey, Date.now().toString());
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer"
        title="Notifications"
        aria-label="View feature notifications"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white"></span>
          </span>
        )}
      </button>

      <NotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        announcements={announcements}
      />
    </>
  );
}
