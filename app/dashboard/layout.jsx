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
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setDashboardUser({
        role: normalizeRole(parsedUser.role || parsedUser.Role),
        name: parsedUser.name || parsedUser.Name || 'PayGuard User',
        email: parsedUser.email || parsedUser.Email || '',
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
