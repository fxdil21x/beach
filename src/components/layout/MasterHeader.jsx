import { Search, CalendarDays, Bell, UserRound, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function MasterHeader({ title = '', onToggleSidebar = () => {} }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="z-20 shrink-0 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-3.5 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 md:hidden"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            {title ? (
              <h1 className="truncate text-base font-semibold text-white md:text-xl">{title}</h1>
            ) : (
              <div className="relative hidden w-72 md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 sm:flex">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            {today}
          </div>
          <button
            type="button"
            className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 hover:bg-zinc-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-xs font-semibold text-white">{user?.name || 'Master'}</p>
              <p className="truncate text-[10px] text-zinc-500">{user?.username || 'admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
