import { useCallback, useEffect, useState } from 'react';
import * as adminApi from '../../api/adminApi.js';

const TOKEN_KEY = 'beach_app_token';

export default function AdminPendingVisitorAlert() {
  const [pendingEntries, setPendingEntries] = useState([]);

  const removeReviewedEntry = useCallback((entryId) => {
    setPendingEntries((current) => current.filter((entry) => entry._id !== entryId));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return undefined;

    const events = new EventSource(adminApi.getPendingVisitorEventsUrl(token));

    events.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === 'pending-list') {
        setPendingEntries(payload.entries);
      }

      if (payload.type === 'pending-created') {
        setPendingEntries((current) => {
          if (current.some((entry) => entry._id === payload.entry._id)) return current;
          return [payload.entry, ...current];
        });
      }

      if (payload.type === 'entry-reviewed') {
        removeReviewedEntry(payload.entry._id);
      }
    };

    return () => events.close();
  }, [removeReviewedEntry]);

  const reviewEntry = async (id, status) => {
    await adminApi.reviewVisitorEntry(id, status);
    removeReviewedEntry(id);
  };

  if (pendingEntries.length === 0) return null;

  const entry = pendingEntries[0];
  const moreCount = pendingEntries.length - 1;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-lg rounded-2xl border border-amber-300 bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Visitor entry waiting</p>
          <p className="text-sm text-gray-600">
            {entry.visitorCount} visitor{entry.visitorCount > 1 ? 's' : ''} · Rs {entry.visitorCount * entry.entryFeePerPerson}
          </p>
          <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</p>
          {moreCount > 0 && <p className="mt-1 text-xs font-medium text-amber-700">+{moreCount} more pending</p>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reviewEntry(entry._id, 'REJECTED')}
            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => reviewEntry(entry._id, 'APPROVED')}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
