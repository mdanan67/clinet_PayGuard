export const STORAGE_KEY = 'payguard_user';

export function normalizeRole(role) {
  const normalizedRole = `${role || ''}`.trim().toLowerCase();

  if (normalizedRole === 'child' || normalizedRole === 'chield') {
    return 'child';
  }

  return 'parent';
}

export const dashboardConfig = {
  parent: {
    sidebarItems: [
      { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
      { label: 'Children', href: '/dashboard/children', icon: 'users' },
      { label: 'Message', href: '/dashboard/messages', icon: 'card' },
      { label: 'Ask Ai', href: '/dashboard/askai', icon: 'shield' },
      { label: 'Set Limit', href: '/dashboard/setlimit', icon: 'chart' },
      { label: 'Transactions', href: '/dashboard/transactions', icon: 'receipt' },
     
    ],
   
  },
  child: {
    sidebarItems: [
      { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
      { label: 'Wallet', href: '/dashboard/wallet', icon: 'wallet' },
      { label: 'Ask Ai', href: '/dashboard/askai', icon: 'shield' },
      { label: 'Limit', href: '/dashboard/goals', icon: 'target' },
    ],
    
  },
};

export function getDashboardConfig(role) {
  return dashboardConfig[normalizeRole(role)] || dashboardConfig.parent;
}
