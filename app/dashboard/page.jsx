'use client';

import DashboardShell from '@/components/dashboard/DashboardShell';
import { STORAGE_KEY, normalizeRole } from '@/components/dashboard/dashboardConfig';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function buildAvatar(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'PG';
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardUser, setDashboardUser] = useState(null);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(STORAGE_KEY);

    if (!savedUser) {
      router.replace('/user/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setDashboardUser({
        role: normalizeRole(parsedUser.role),
        name: parsedUser.name || 'PayGuard User',
        email: parsedUser.email || '',
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      router.replace('/user/login');
    }
  }, [router]);

  if (!dashboardUser) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-slate-500">Loading dashboard...</div>;
  }

  return (
    <DashboardShell
      role={dashboardUser.role}
      title="Order"
      subtitle="Dashboard"
      userName={dashboardUser.name}
      userEmail={dashboardUser.email}
      userAvatar={buildAvatar(dashboardUser.name)}
    >
      
    </DashboardShell>
  );
}
