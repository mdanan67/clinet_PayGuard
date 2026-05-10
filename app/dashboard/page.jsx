'use client';

import ChildBalance from '@/Pages/ChildBalance/ChildBalance';
import ParentBalance from '@/Pages/ParentBalances/ParentBalance';
import { STORAGE_KEY, normalizeRole } from '@/components/dashboard/dashboardConfig';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [role, setRole] = useState('parent');

  useEffect(() => {
    const savedUser = window.localStorage.getItem(STORAGE_KEY);

    if (!savedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setRole(normalizeRole(parsedUser.role || parsedUser.Role));
    } catch {
      setRole('parent');
    }
  }, []);

  return role === 'child' ? <ChildBalance /> : <ParentBalance />;
}
