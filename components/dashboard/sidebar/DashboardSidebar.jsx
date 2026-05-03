'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getDashboardConfig, normalizeRole } from '../dashboardConfig';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardSidebar({ open, onClose, role = 'parent' }) {
  const pathname = usePathname();
  const currentRole = normalizeRole(role);
  const { sidebarItems = [] } = getDashboardConfig(currentRole);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 z-50 w-64 bg-white border-r border-slate-200',
          'transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
          'top-0 h-dvh',
          'md:top-0 md:h-screen md:translate-x-0 md:sticky md:z-auto'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <span className="text-lg font-bold">P</span>
              </div>
              <div>
                <p className="text-sm font-bold">Dashboard</p>
                <p className="text-xs text-slate-500">PayGuard</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <span className="text-lg">
                    {item.icon === 'grid' && '📊'}
                    {item.icon === 'users' && '👥'}
                    {item.icon === 'card' && '💬'}
                    {item.icon === 'shield' && '🤖'}
                    {item.icon === 'chart' && '📈'}
                    {item.icon === 'receipt' && '📄'}
                    {item.icon === 'wallet' && '💰'}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-3 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              <span>❓</span>
              Support
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              <span>⚙️</span>
              Settings
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
