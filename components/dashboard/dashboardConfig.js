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
      { label: 'Children', href: '/dashboard/child', icon: 'users' },
      { label: 'Message', href: '/dashboard/messanger', icon: 'card' },
      // { label: 'Ask Ai', href: '/dashboard/askai', icon: 'shield' },
      { label: 'Set Limit', href: '/dashboard/set_limit', icon: 'chart' },
      { label: 'Transactions', href: '/dashboard/transaction', icon: 'receipt' },
    ],
  },
  child: {
    sidebarItems: [
      { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
      { label: 'recent-transactions', href: '/dashboard/recent-transactions', icon: 'receipt' },
      { label: 'Message', href: '/dashboard/messanger', icon: 'card' },
      { label: 'Expense Limits', href: '/dashboard/ExpenseLimits', icon: 'chart' },
    ],
  },
};

export function getDashboardConfig(role) {
  return dashboardConfig[normalizeRole(role)] || dashboardConfig.parent;
}
