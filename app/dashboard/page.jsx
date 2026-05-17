'use client';

import { STORAGE_KEY, normalizeRole } from '@/components/dashboard/dashboardConfig';
import History from '@/components/History/History';
import ChildBalance from '@/Pages/ChildBalance/ChildBalance';
import ParentBalance from '@/Pages/ParentBalances/ParentBalance';
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

  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="w-full min-w-0">
        {role === 'child' ? <ChildBalance /> : <ParentBalance />}
      </div>
      {role === 'parent' && (
        <div className="w-full min-w-0">
          <History />
        </div>
      )}
    </div>
  );
}
