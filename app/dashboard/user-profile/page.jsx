'use client';

import { STORAGE_KEY } from '@/components/dashboard/dashboardConfig';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

const emptyProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  role: 'parent',
  profileImage: '',
};

function splitName(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [draftProfile, setDraftProfile] = useState(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const normalizeProfile = (data) => {
    const nameParts = splitName(data?.name || data?.Name);

    return {
      firstName: data?.firstName || data?.FirstName || nameParts.firstName,
      lastName: data?.lastName || data?.LastName || nameParts.lastName,
      email: data?.email || data?.Email || '',
      phone: data?.phone || data?.Phone || '',
      address: data?.address || data?.Address || '',
      role: data?.role || data?.Role || 'parent',
      profileImage: data?.profileImage || data?.ProfileImage || data?.profile_image || '',
    };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await axios.get(`${API_BASE_URL}/api/User/profile`, {
          withCredentials: true,
        });

        const nextProfile = normalizeProfile(response.data);

        setProfile(nextProfile);
        setDraftProfile(nextProfile);
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...nextProfile,
            name: `${nextProfile.firstName} ${nextProfile.lastName}`.trim(),
          })
        );
      } catch (error) {
        const savedUser = window.localStorage.getItem(STORAGE_KEY);

        if (!savedUser) {
          setErrorMessage(error.response?.data?.message || 'Failed to load profile');
          return;
        }

        try {
          const nextProfile = normalizeProfile(JSON.parse(savedUser));
          setProfile(nextProfile);
          setDraftProfile(nextProfile);
          setErrorMessage(error.response?.data?.message || 'Showing saved profile until the server is available');
        } catch {
          setProfile(emptyProfile);
          setDraftProfile(emptyProfile);
          setErrorMessage('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fullName = useMemo(() => {
    const name = `${profile.firstName} ${profile.lastName}`.trim();
    return name || 'PayGuard User';
  }, [profile.firstName, profile.lastName]);

  const initials = useMemo(() => {
    const first = profile.firstName?.charAt(0) || 'U';
    const last = profile.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }, [profile.firstName, profile.lastName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraftProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraftProfile((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setDraftProfile(profile);
    setMessage('');
    setEditing(true);
  };

  const handleCancel = () => {
    setDraftProfile(profile);
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const nextProfile = {
      ...draftProfile,
      firstName: draftProfile.firstName.trim(),
      lastName: draftProfile.lastName.trim(),
      email: draftProfile.email.trim(),
      phone: draftProfile.phone.trim(),
      address: draftProfile.address.trim(),
    };

    try {
      setSaving(true);
      setMessage('');
      setErrorMessage('');

      const response = await axios.post(
        `${API_BASE_URL}/api/User/EditProfile`,
        {
          firstName: nextProfile.firstName,
          lastName: nextProfile.lastName,
          email: nextProfile.email,
          phone: nextProfile.phone,
          profileImage: nextProfile.profileImage,
        },
        { withCredentials: true }
      );

      const savedProfile = normalizeProfile(response.data?.user || nextProfile);

      setProfile({
        ...savedProfile,
        address: nextProfile.address,
      });
      setDraftProfile({
        ...savedProfile,
        address: nextProfile.address,
      });
      setEditing(false);
      setMessage(response.data?.message || 'Profile updated successfully');

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...savedProfile,
          address: nextProfile.address,
          name: `${savedProfile.firstName} ${savedProfile.lastName}`.trim(),
        })
      );
      window.dispatchEvent(new Event('payguard-profile-updated'));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.title ||
          'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Account profile
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and update your personal account information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 md:w-auto"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.9 4.6l2.5 2.5M4 20h4.5L19 9.5a1.8 1.8 0 0 0 0-2.5L17 5a1.8 1.8 0 0 0-2.5 0L4 15.5V20z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={fullName}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-extrabold text-white shadow-lg ring-1 ring-slate-200">
                  {initials}
                </div>
              )}
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-950">{fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">{profile.email || 'No email added'}</p>

            <span className="mt-4 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-700">
              {profile.role || 'parent'}
            </span>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                @
              </span>
              <span className="truncate">{profile.email || 'Email not added'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                #
              </span>
              <span>{profile.phone || 'Phone number not added'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                +
              </span>
              <span>{profile.address || 'Address not added'}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                {editing ? 'Edit Information' : 'Personal Information'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editing ? 'Update the fields below.' : 'Your saved account details.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">First Name</span>
                <input
                  name="firstName"
                  value={draftProfile.firstName}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="First name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:text-slate-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Last Name</span>
                <input
                  name="lastName"
                  value={draftProfile.lastName}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Last name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:text-slate-500"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  name="email"
                  value={draftProfile.email}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="email@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:text-slate-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Phone Number</span>
                <input
                  name="phone"
                  value={draftProfile.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+880 1XXXXXXXXX"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:text-slate-500"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Address</span>
              <input
                name="address"
                value={draftProfile.address}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Your address"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:text-slate-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Profile Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!editing}
                className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed"
              />
            </label>

            {editing && (
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
