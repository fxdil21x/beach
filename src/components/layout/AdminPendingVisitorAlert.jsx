import { useCallback, useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const TOKEN_KEY = 'beach_app_token';

export default function AdminPendingVisitorAlert() {
  const { user } = useAuth();
  const [pendingEntries, setPendingEntries] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);

  const removeReviewedEntry = useCallback((entryId) => {
    setPendingEntries((current) => current.filter((entry) => entry._id !== entryId));
  }, []);

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MASTER_ADMIN')) return undefined;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return undefined;

    const events = new EventSource(adminApi.getPendingVisitorEventsUrl(token));

    events.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === 'pending-list') {
        setPendingEntries(payload.entries || []);
      }

      if (payload.type === 'pending-created') {
        setPendingEntries((current) => {
          if (current.some((entry) => entry._id === payload.entry._id)) return current;
          return [payload.entry, ...current];
        });
      }

      if (payload.type === 'entry-reviewed') {
        removeReviewedEntry(payload.entry._id);
        window.dispatchEvent(new CustomEvent('visitor-entry-updated', { detail: payload }));
      }
    };

    return () => events.close();
  }, [removeReviewedEntry]);

  const reviewEntry = async (id, status) => {
    if (submittingId) return;
    setSubmittingId(id);
    // Optimistically clear/remove entry immediately so admin cannot click twice
    removeReviewedEntry(id);
    try {
      await adminApi.reviewVisitorEntry(id, status);
      window.dispatchEvent(new CustomEvent('visitor-entry-updated', { detail: { type: 'entry-reviewed', entry: { _id: id, status } } }));
    } catch (err) {
      console.error('Failed to review entry:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MASTER_ADMIN') || pendingEntries.length === 0) return null;

  const entry = pendingEntries[0];
  const moreCount = pendingEntries.length - 1;
  const isSubmitting = submittingId === entry._id;

  return (
    <div className="pointer-events-auto absolute bottom-full mb-3 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-amber-400/80 bg-white/95 backdrop-blur-md p-4 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <p className="text-sm font-bold text-gray-900 truncate">Visitor entry waiting</p>
          </div>
          <p className="text-xs font-semibold text-gray-600 mt-0.5">
            {entry.visitorCount} visitor{entry.visitorCount > 1 ? 's' : ''} · Rs {entry.visitorCount * entry.entryFeePerPerson}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(entry.createdAt).toLocaleString()}</p>
          {moreCount > 0 && (
            <p className="mt-1 text-[11px] font-bold text-amber-700">+{moreCount} more pending</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => reviewEntry(entry._id, 'REJECTED')}
            className="rounded-xl bg-red-100 hover:bg-red-200 active:scale-95 px-3.5 py-2 text-xs font-bold text-red-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => reviewEntry(entry._id, 'APPROVED')}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}
