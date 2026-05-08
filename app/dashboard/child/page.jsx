'use client';

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const Page = () => {
  const [showForm, setShowForm] = useState(false);
  const [allchild, setAllChild] = useState([]);
  const [activeSendChildId, setActiveSendChildId] = useState(null);
  const [sendAmounts, setSendAmounts] = useState({});

  const formatAmount = (value) => Number(value ?? 0).toFixed(2);

  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    BirthDate: '',
    Email: '',
    Password: '',
    ConfirmPassword: '',
    Gender: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendAmountChange = (childId, value) => {
    setSendAmounts((prev) => ({
      ...prev,
      [childId]: value,
    }));
  };

  const handleSendMoney = async (child) => {
    const childId = child.id || child.Id;
    const wallet = child.wallet || child.Wallet;
    const walletId = wallet?.id || wallet?.Id;
    const amount = Number(sendAmounts[childId]);

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    console.log('Send money payload:', {
      childId,
      walletId,
      amount,
    });

    // Add your API call here later.
    // await axios.post('YOUR_API_URL', { childId, walletId, amount }, { withCredentials: true })

    setSendAmounts((prev) => ({
      ...prev,
      [childId]: '',
    }));
    setActiveSendChildId(null);
  };
  const getAllChild = useCallback(async () => {
    try {
      const child = await axios.get('http://localhost:5080/api/Parent/GetAllChil', {
        withCredentials: true,
      });

      const childList = child.data?.allchildinquary || [];

      setAllChild(childList);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getAllChild();
  }, [getAllChild]);

  const handleAddChild = async (e) => {
    e.preventDefault();

    if (
      !formData.FirstName ||
      !formData.LastName ||
      !formData.BirthDate ||
      !formData.Email ||
      !formData.Password ||
      !formData.ConfirmPassword ||
      !formData.Gender
    ) {
      alert('Please fill all fields');
      return;
    }

    if (formData.Password !== formData.ConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5080/api/User/childRegistration',
        {
          firstName: formData.FirstName,
          lastName: formData.LastName,
          birthDate: formData.BirthDate,
          email: formData.Email,
          gender: formData.Gender,
          password: formData.Password,
        },
        { withCredentials: true }
      );

      setFormData({
        FirstName: '',
        LastName: '',
        BirthDate: '',
        Email: '',
        Password: '',
        ConfirmPassword: '',
        Gender: '',
      });

      setShowForm(false);
      await getAllChild();
    } catch (error) {
      console.log('Status:', error.response?.status);
      console.log('Backend error:', error.response?.data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium text-blue-600">Family dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Children Management</h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage your children profiles and wallet balances.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 md:w-auto"
        >
          + Add Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allchild.map((child) => {
          const wallet = child.wallet || child.Wallet;
          const childId = child.id || child.Id;
          const isSendOpen = activeSendChildId === childId;

          return (
            <div
              key={childId}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {child.name ||
                        child.Name ||
                        `${child.FirstName || ''} ${child.LastName || ''}`.trim() ||
                        'Child'}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {child.Gender || child.gender || 'N/A'}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700">
                    {(child.name || child.Name || 'C').charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-xs font-medium uppercase text-red-500">Spend</p>
                    <p className="mt-1 text-base font-bold text-red-700">
                      ${formatAmount(wallet?.totalSpend || wallet?.TotalSpend)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs font-medium uppercase text-emerald-500">Balance</p>
                    <p className="mt-1 text-base font-bold text-emerald-700">
                      ${formatAmount(wallet?.balance || wallet?.Balance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="truncate">Email: {child.Email || child.email}</p>
                  <p>
                    Birth Date:{' '}
                    {child.BirthDate || child.birthDate
                      ? new Date(child.BirthDate || child.birthDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSendChildId(isSendOpen ? null : childId)}
                  className="w-full cursor-pointer rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Send Money
                </button>

                {isSendOpen && (
                  <div className="space-y-2.5 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={sendAmounts[childId] || ''}
                      onChange={(e) => handleSendAmountChange(childId, e.target.value)}
                      placeholder="Enter amount"
                      className="w-full rounded-lg border border-blue-200 bg-white p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSendMoney(child)}
                        className="flex-1 cursor-pointer rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSendChildId(null)}
                        className="flex-1 cursor-pointer rounded-lg bg-white py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Child</h2>

              <button
                type="button"
                className="cursor-pointer rounded-full px-2.5 py-1 text-lg transition hover:bg-white/10"
                onClick={() => setShowForm(false)}
              >
                X
              </button>
            </div>

            <form onSubmit={handleAddChild} className="p-5 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <input
                type="date"
                name="BirthDate"
                value={formData.BirthDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  type="password"
                  name="ConfirmPassword"
                  value={formData.ConfirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 cursor-pointer rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
