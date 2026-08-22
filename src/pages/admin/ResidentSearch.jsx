import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Phone, UserRound } from 'lucide-react';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import ResidentPhoto from '../../components/resident/ResidentPhoto.jsx';
import { ResidentSearchSkeleton } from '../../components/ui/Skeleton.jsx';
import { adminNav } from '../../config/navigation.js';
import * as adminApi from '../../api/adminApi.js';

function maskPhoneLast4(last4) {
  if (!last4) return null;
  return `XXXXXX${String(last4).slice(-4)}`;
}

export default function AdminResidentSearch() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [residents, setResidents] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearched(true);
    try {
      const { data } = await adminApi.searchResidents({ name: query.trim() });
      setResidents(data.data.residents || []);
    } catch {
      setResidents([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <MobileHeader title={t('admin.searchTitle')} targetRole="admin" />
      <main className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white sm:p-6">
          <h2 className="text-xl font-bold leading-snug sm:text-2xl">{t('admin.searchTitle')}</h2>
          <p className="mt-2 text-sm opacity-90">{t('admin.searchHint')}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} />
        </div>

        {searching && <ResidentSearchSkeleton count={3} />}

        {!searching && searched && residents.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="font-medium text-gray-900">{t('common.noResults')}</p>
          </div>
        )}

        <div className="space-y-3">
          {residents.map((r) => {
            const maskedPhone = maskPhoneLast4(r.phoneLast4);
            return (
              <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex gap-4">
                  {r.photoUrl ? (
                    <ResidentPhoto src={r.photoUrl} alt={r.name} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-20 sm:w-20">
                      <UserRound className="h-8 w-8" strokeWidth={1.75} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-base font-bold leading-snug text-gray-900 sm:text-lg">{r.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${
                          r.isRegistered
                            ? r.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r.isRegistered
                          ? r.isActive
                            ? t('admin.registeredActive')
                            : t('admin.registeredDisabled')
                          : t('admin.masterRecord')}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
                        <span className="min-w-0 break-words">{r.houseName || '—'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
                        <span className="min-w-0 break-words">
                          {t('resident.fatherName')}: {r.guardianName || '—'}
                        </span>
                      </div>
                      {maskedPhone && (
                        <div className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
                          <span className="font-mono tracking-wide">{maskedPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <BottomNavigation items={adminNav} />
    </div>
  );
}
