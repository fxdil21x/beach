import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import NotificationModal from './NotificationModal.jsx';
import { getPublicAnnouncements } from '../../api/announcementApi.js';

export default function NotificationBell({ targetRole = 'user' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const STORAGE_KEY = `last_seen_announcement_${targetRole}`;

  const fetchAnnouncements = useCallback(async () => {
    try {
      const { data } = await getPublicAnnouncements(targetRole);
      const list = data.data.announcements || [];
      setAnnouncements(list);

      const lastSeen = localStorage.getItem(STORAGE_KEY);
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
  }, [targetRole, STORAGE_KEY]);

  useEffect(() => {
    fetchAnnouncements();
    // Poll every 60 seconds
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
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
