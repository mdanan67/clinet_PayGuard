'use client';

import Navbar from '@/Pages/Navbar/Navbar';
import { STORAGE_KEY, normalizeRole } from '@/components/dashboard/dashboardConfig';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

axios.defaults.withCredentials = true;

export default function ParentLogin() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const renderPasswordIcon = (isVisible) =>
    isVisible ? (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M2 2l20 20" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M7.4 7.4C4.6 8.8 2.7 11.4 2 12c1.8 2.5 5.2 6 10 6 1.5 0 2.9-.3 4.1-.9" />
        <path d="M14.5 5.2C13.7 5.1 12.9 5 12 5 7 5 3.6 8.5 2 12" />
        <path d="M19.1 8.6c1.2 1 2.2 2.2 2.9 3.4-.6.8-1.5 1.8-2.6 2.7" />
      </svg>
    ) : (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const getRoleFromResponse = (data) =>
    normalizeRole(data?.role || data?.user?.role || data?.data?.role || data?.result?.role);

  const buildStoredUser = (data) => {
    const user = data?.user || data?.data?.user || {};
    const firstName = user.firstName || user.FirstName || data?.firstName || data?.FirstName || '';
    const lastName = user.lastName || user.LastName || data?.lastName || data?.LastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      role: getRoleFromResponse(data),
      firstName,
      lastName,
      name:
        user.name ||
        user.fullName ||
        data?.name ||
        fullName ||
        formData.email.split('@')[0] ||
        'User',
      email: user.email || user.Email || data?.email || data?.Email || formData.email,
      phone: user.phone || user.Phone || data?.phone || data?.Phone || '',
      profileImage:
        user.profileImage ||
        user.ProfileImage ||
        user.profile_image ||
        data?.profileImage ||
        data?.ProfileImage ||
        data?.profile_image ||
        '',
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setSuccessMessage('');

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      setErrors({});
      setSuccessMessage('');

      const response = await axios.post('http://localhost:5080/api/User/login', {
        email: formData.email,
        password: formData.password,
      });

      // ✅ Store ONLY user info (NOT token)
      const userData = buildStoredUser(response.data);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      setSuccessMessage('Login successful');

      // Redirect
      router.push('/dashboard');
    } catch (error) {
      setSuccessMessage('');
      setErrors({
        api: error.response?.data?.message || 'Login failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex items-center justify-center mt-15 px-4 py-16">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="flex flex-col justify-center bg-slate-900 p-10 text-white">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm">
              Welcome Back
            </span>

            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Sign in to manage your child’s spending
            </h1>

            <p className="mb-8 text-slate-300">
              Access your parent dashboard to monitor payments, manage spending limits, and track
              every transaction securely.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="p-8 md:p-10">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-bold text-slate-900">Login to your account</h2>

              <p className="mt-2 text-slate-500">Enter your details to access your dashboard.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full rounded-xl border px-4 py-3"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-xl border px-4 py-3 pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {renderPasswordIcon(showPassword)}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

                {errors.api && <p className="text-sm text-red-500">{errors.api}</p>}
                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 py-3 text-white"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don’t have an account?{' '}
                <a href="/user/registration" className="font-medium  text-green-500">
                  Create one
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
