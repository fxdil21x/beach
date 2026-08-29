import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MasterSidebar from '../../components/layout/MasterSidebar.jsx';
import MasterHeader from '../../components/layout/MasterHeader.jsx';
import PageContainer from '../../components/layout/PageContainer.jsx';

export default function MasterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <MasterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <MasterHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
