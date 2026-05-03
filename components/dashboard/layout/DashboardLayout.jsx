'use client';

import { useEffect, useState } from 'react';
import DashboardSidebar from '../sidebar/DashboardSidebar';
import DashboardTopbar from '../topbar/DashboardTopbar';

export default function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="md:flex">
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={user?.role}
        />

        <main className="flex-1 min-w-0">
          <DashboardTopbar
            onMenuClick={() => setSidebarOpen(true)}
            user={user}
          />

          <div className="relative min-h-[calc(100vh-80px)] px-4 md:px-6 py-5 space-y-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}