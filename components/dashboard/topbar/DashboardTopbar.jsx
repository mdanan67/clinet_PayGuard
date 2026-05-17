'use client';

import { STORAGE_KEY } from '@/components/dashboard/dashboardConfig';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

export default function DashboardTopbar({ onMenuClick, user }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const profileImage = user?.profileImage || '';

  const handleViewProfile = () => {
    setProfileOpen(false);
    router.push('/dashboard/user-profile');
  };

  const clearClientSession = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.clear();
    document.cookie.split(';').forEach((cookie) => {
      const cookieName = cookie.split('=')[0].trim();

      if (cookieName) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/User/logout`, null, {
        withCredentials: true,
      });
    } catch (error) {
      console.log('Logout cookie clear failed:', error.response?.data || error.message);
    } finally {
      clearClientSession();
      setProfileOpen(false);
      router.replace('/user/login');
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 lg:hidden hover:bg-slate-50 transition"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {user?.role || 'Dashboard'}
            </p>
            <h1 className="text-xl font-bold leading-tight text-slate-900">Dashboard</h1>
          </div>
        </div>

        {/* Right Side - User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <button
            type="button"
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 sm:inline-flex"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-2.5 transition hover:bg-slate-50"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name || 'User'}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                  {userInitial}
                </div>
              )}
              <div className="hidden max-w-[180px] text-left leading-tight sm:block">
                <p className="truncate text-sm font-semibold leading-5 text-slate-900">
                  {user?.name || 'User'}
                </p>
                <p className="truncate text-xs leading-4 text-slate-500">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <svg
                className={`hidden h-4 w-4 text-slate-500 transition sm:block ${profileOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                role="menu"
              >
                <Link
                  href="/dashboard/user-profile"
                  type="button"
                  onClick={handleViewProfile}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  role="menuitem"
                >
                  <svg
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
                    />
                  </svg>
                  View profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                  role="menuitem"
                >
                  <svg
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12H4"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7l-5 5 5 5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
