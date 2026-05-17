'use client';

import { STORAGE_KEY, normalizeRole } from '@/components/dashboard/dashboardConfig';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

export default function DashboardRootLayout({ children }) {
  const router = useRouter();
  const [dashboardUser, setDashboardUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildDashboardUser = (data) => {
      const firstName = data.firstName || data.FirstName || '';
      const lastName = data.lastName || data.LastName || '';

      return {
        firstName,
        lastName,
        role: normalizeRole(data.role || data.Role),
        name:
          data.name ||
          data.Name ||
          `${firstName} ${lastName}`.trim() ||
          'PayGuard User',
        email: data.email || data.Email || '',
        profileImage:
          data.profileImage ||
          data.ProfileImage ||
          data.profile_image ||
          '',
      };
    };

    const loadDashboardUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/User/profile`, {
          withCredentials: true,
        });
        const verifiedUser = buildDashboardUser(response.data);

        setDashboardUser(verifiedUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        router.replace('/user/login');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardUser();

    const handleProfileUpdated = () => {
      try {
        const savedUser = window.localStorage.getItem(STORAGE_KEY);

        if (savedUser) {
          setDashboardUser(buildDashboardUser(JSON.parse(savedUser)));
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    };

    window.addEventListener('payguard-profile-updated', handleProfileUpdated);

    return () => {
      window.removeEventListener('payguard-profile-updated', handleProfileUpdated);
    };
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
