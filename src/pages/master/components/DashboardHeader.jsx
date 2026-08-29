import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown, Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function DashboardHeader({ selectedPeriod = 'This Year', onPeriodChange = () => {} }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 || hour < 5) {
    greeting = 'Good evening';
  }

  const displayName = user?.name ? user.name.split(' ')[0] : 'Arthur';

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const periods = [
    { key: 'Today', label: `Today (${todayFormatted})` },
    { key: 'This Week', label: 'This Week' },
    { key: 'This Month', label: 'This Month' },
    { key: 'This Year', label: 'This Year' },
    { key: 'All Time', label: 'All Time' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {greeting}, {displayName}
          </h1>
          <span className="text-xl">👋</span>
        </div>
        <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
          Here's what's happening with your beach operations today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#121214] px-3.5 py-2 text-xs font-medium text-zinc-200 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-800/80"
          >
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span>{selectedPeriod === 'Today' ? todayFormatted : selectedPeriod}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-zinc-800 bg-[#18181b] p-1.5 shadow-2xl backdrop-blur">
              {periods.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    onPeriodChange(p.key);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    selectedPeriod === p.key
                      ? 'bg-orange-500/15 text-orange-400 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{p.label}</span>
                  {selectedPeriod === p.key && <Check className="h-3.5 w-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={() => navigate('/master/notifications')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-[#121214] text-zinc-300 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-800"
          aria-label="View Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-zinc-950">
            3
          </span>
        </button>
      </div>
    </div>
  );
}
