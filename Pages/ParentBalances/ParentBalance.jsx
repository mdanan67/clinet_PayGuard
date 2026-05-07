'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

export default function ParentBalance() {
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getWalletStatus = async () => {
    try {
      setFetchingBalance(true);
      setErrorMessage('');

      const response = await axios.get(
        `${API_BASE_URL}/api/Parent/GetWalletStaus`,
        { withCredentials: true }
      );

      const data = response.data;
      
      const walletBalance =
        typeof data === 'number'
          ? data
          : Number(data?.balance ?? data?.walletBalance ?? data?.amount ?? 0);

      const spent = Number(data?.totalSpent ?? data?.totalSpend ?? data?.spent ?? 0);

      setBalance(Number.isFinite(walletBalance) ? walletBalance : 0);
      setTotalSpent(Number.isFinite(spent) ? spent : 0);
    } catch (error) {
      console.error('Wallet status error:', error);
      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to load wallet balance'
      );
    } finally {
      setFetchingBalance(false);
    }
  };

  useEffect(() => {
    getWalletStatus();
  }, []);

  const handleAddBalance = async () => {
    const amount = Number(addAmount);

    if (!addAmount || Number.isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await axios.post(
        `${API_BASE_URL}/api/Payment/create-checkout-session`,
        { amount },
        { withCredentials: true }
      );

      if (!response.data?.url) {
        alert('Payment session URL was not returned');
        return;
      }

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Stripe redirect error:', error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-8 py-2">
      <div className="w-full">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Wallet Overview
          </p>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Current Balance
                </p>

                <h2 className="mt-4 text-4xl font-extrabold text-slate-950">
                  {fetchingBalance ? 'Loading...' : `$${balance.toFixed(2)}`}
                </h2>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-xl">
                💰
              </div>
            </div>

            <div className="mt-6">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min((balance / 1000) * 100, 100)}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-500">Available funds</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Total Spend
                </p>

                <h2 className="mt-4 text-4xl font-extrabold text-slate-950">
                  ${totalSpent.toFixed(2)}
                </h2>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-xl">
                📊
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Spending this month
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  Add Balance
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Add Funds
                </h2>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl">
                ➕
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBalance();
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

              <button
                onClick={handleAddBalance}
                disabled={loading}
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Add Funds'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}