'use client';

import Link from 'next/link';
import { getDashboardConfig, normalizeRole } from './dashboardConfig';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Icon({ name, className = 'h-5 w-5' }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'grid':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 4.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'card':
      return (
        <svg {...props}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19" />
          <path d="M7 15h3" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
          <path d="m9.5 12 1.7 1.7 3.3-3.9" />
        </svg>
      );
    case 'receipt':
      return (
        <svg {...props}>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19h16" />
          <path d="M7 16V9" />
          <path d="M12 16V5" />
          <path d="M17 16v-4" />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...props}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5Z" />
          <path d="M3 8h15a2 2 0 0 1 2 2v1h-5a2 2 0 0 0 0 4h5v1a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 15.5Z" />
          <circle cx="15.5" cy="13" r=".5" fill="currentColor" />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case 'gift':
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13" />
          <path d="M19 12v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" />
          <path d="M7.5 8A2.5 2.5 0 1 1 12 5.5V8" />
          <path d="M16.5 8A2.5 2.5 0 1 0 12 5.5V8" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...props}>
          <path d="M15 17H5.5A1.5 1.5 0 0 1 4 15.5v-4.1A6.5 6.5 0 0 1 10.5 4 6.5 6.5 0 0 1 17 11.4v4.1A1.5 1.5 0 0 1 15.5 17H15" />
          <path d="M9 20a2.5 2.5 0 0 0 5 0" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

export default function DashboardShell({
  role = 'parent',
  title = 'Dashboard',
  subtitle = 'Overview',
  userName = 'Jay Hargudson',
  userEmail = 'jay@example.com',
  userAvatar = 'JH',
  children,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const currentRole = normalizeRole(role);
  const { sidebarItems = [] } = getDashboardConfig(currentRole);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-sm transition-transform duration-300 lg:translate-x-0',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-200">
              <span className="text-lg font-bold">P</span>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">Dashboard</p>
              <p className="text-xs text-slate-500">workspace</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={`${currentRole}-${item.label}`}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="bell" className="h-5 w-5" />
              Support
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name="shield" className="h-5 w-5" />
              Settings
            </button>
          </div>
        </aside>

        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div className="flex min-h-screen flex-1 flex-col lg:ml-[272px]">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Icon name="menu" />
                </button>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">
                    {currentRole}
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 sm:inline-flex"
                >
                  <Icon name="search" />
                </button>
                <button
                  type="button"
                  className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 sm:inline-flex"
                >
                  <Icon name="bell" />
                </button>

                <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-bold text-white">
                    {userAvatar}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
