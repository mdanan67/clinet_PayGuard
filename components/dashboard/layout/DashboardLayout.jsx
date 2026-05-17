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
          user={user}
        />

        <main className="min-w-0 flex-1 w-full">
          <DashboardTopbar
            onMenuClick={() => setSidebarOpen(true)}
            user={user}
          />

          <div className="relative min-h-[calc(100vh-4rem)] px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
