import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/layout/MobileHeader.jsx';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import { userNav } from '../../config/navigation.js';
import SearchInput from '../../components/ui/SearchInput.jsx';
import ResidentSearchCard from '../../components/resident/ResidentSearchCard.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as residentApi from '../../api/residentApi.js';

export default function ResidentSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await residentApi.searchResidents(query.trim());
      setRecords(data.data.records);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (resident) => {
    navigate('/user/register', { state: { resident } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MobileHeader title={t('resident.searchTitle')} showLanguage />
      <main className="space-y-4 px-4 py-6">
        <p className="text-sm text-gray-600">{t('resident.searchHint')}</p>
        <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} placeholder={t('resident.searchPlaceholder')} />
        {loading && <LoadingSpinner size="lg" className="mx-auto" />}
        {!loading && searched && records.length === 0 && (
          <EmptyState title={t('common.noResults')} />
        )}
        <div className="space-y-3">
          {records.map((r) => (
            <ResidentSearchCard key={r.id} resident={r} onSelect={handleSelect} />
          ))}
        </div>
      </main>
      <BottomNavigation items={userNav} />
    </div>
  );
}
