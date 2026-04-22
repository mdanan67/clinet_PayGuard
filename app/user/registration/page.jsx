'use client';
import Navbar from '@/Pages/Navbar/Navbar';
import axios from 'axios';
import { useState } from 'react';

export default function ParentRegistration() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Must include uppercase, lowercase, number & special character (@$!%*?&)';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
    setSuccessMessage('');

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:5080/api/User/registation', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      console.log(response.data);

      setSuccessMessage('Account created successfully');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error) {
      console.log('Full error:', error.response?.data);

      // .NET returns field errors under error.response.data.errors
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        // Map .NET PascalCase field names → camelCase to match form field names
        const mapped = {};
        Object.entries(backendErrors).forEach(([field, messages]) => {
          const key = field.charAt(0).toLowerCase() + field.slice(1);
          mapped[key] = messages[0];
        });
        setErrors(mapped);
      } else {
        const message = error.response?.data?.message || 'Something went wrong. Please try again.';
        setErrors({ api: message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-16">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">

          {/* Left panel — hidden on mobile, visible md+ */}
          <div className="hidden md:flex flex-col justify-center bg-slate-900 p-10 text-white">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm">
              Parent Account
            </span>

            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Take control of your child's spending
            </h1>

            <p className="mb-8 text-slate-300">
              Set smart limits, track every transaction in real time, and guide your child toward
              better financial habits—all from one secure platform.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl bg-white/10 p-4">
                <h3 className="font-semibold">Quick setup</h3>
                <p className="text-sm text-slate-300">
                  Get started in seconds and begin managing your child's spending right away.
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <h3 className="font-semibold">Smart spending control</h3>
                <p className="text-sm text-slate-300">
                  Set category-based limits and control exactly how your child can use their money.
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <h3 className="font-semibold">Real-time monitoring</h3>
                <p className="text-sm text-slate-300">
                  Monitor every transaction instantly with full visibility from your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="p-8 md:p-10">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
              <p className="mt-2 text-slate-500">
                Sign up as a parent to start managing and controlling your child's spending.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">

                {/* First Name + Last Name — side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email — full width */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Password — full width */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password — full width */}
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {errors.api && <p className="text-sm text-red-500">{errors.api}</p>}
                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 py-3 text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <a href="/user/login" className="font-medium text-slate-900 underline">
                  Login
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}