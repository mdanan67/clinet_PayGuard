'use client';

export default function DashboardTopbar({ onMenuClick, user }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 lg:hidden hover:bg-slate-50 transition"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {user?.role || 'Dashboard'}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
        </div>

        {/* Right Side - User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Button (hidden on small screens) */}
          <button className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Notifications */}
          <button className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition relative">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 transition cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
