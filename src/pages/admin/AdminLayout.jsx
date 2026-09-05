import { Outlet } from 'react-router-dom';
import BottomNavigation from '../../components/layout/BottomNavigation.jsx';
import { adminNav } from '../../config/navigation.js';

export default function AdminLayout() {
  return (
    <div className="relative flex h-full w-full flex-1 min-h-0 flex-col overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <Outlet />
      </div>
      <BottomNavigation items={adminNav} />
    </div>
  );
}
