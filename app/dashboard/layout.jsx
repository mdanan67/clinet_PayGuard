'use client';

import { STORAGE_KEY, normalizeRole } from '@/components/dashboard/dashboardConfig';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardRootLayout({ children }) {
  const router = useRouter();
  const [dashboardUser, setDashboardUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!dashboardUser) {
    return null;
  }

  return (
    <DashboardLayout user={dashboardUser}>
      {children}
    </DashboardLayout>
  );
}
