'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

const StatCard = ({ label, value, helper, tone = 'blue' }) => {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700',
    rose: 'bg-rose-50 text-rose-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-950">{value}</h2>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold ${toneClasses[tone]}`}
        >
          $
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">{helper}</p>
    </div>
  );
};

const spendingCategories = [
  'Food',
  'Education',
  'Transport',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  'Mobile',
  'Others',
];

const ChildBalance = () => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCategory, setPaymentCategory] = useState('');
  const [walletStatus, setWalletStatus] = useState({
    balance: 0,
    currentMonthExpense: 0,
  });
  const [fetchingWallet, setFetchingWallet] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const currentBalance = Number(walletStatus.balance || 0);
  const monthlyExpense = Number(walletStatus.currentMonthExpense || 0);

  const loadWalletStatus = async () => {
    try {
      setFetchingWallet(true);
      setErrorMessage('');

      const response = await axios.get(`${API_BASE_URL}/api/Child/GetWalletStatus`, {
        withCredentials: true,
      });

      setWalletStatus({
        balance: Number(response.data?.balance ?? 0),
        currentMonthExpense: Number(response.data?.currentMonthExpense ?? 0),
      });
    } catch (error) {
      console.error('Child wallet status error:', error);

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to load wallet status.'
      );
    } finally {
      setFetchingWallet(false);
    }
  };

  useEffect(() => {
    loadWalletStatus();
  }, []);

  const handleRequestMoney = async (event) => {
    event.preventDefault();

    const requestAmount = Number(amount);
    setMessage('');
    setErrorMessage('');

    if (!amount || Number.isNaN(requestAmount) || requestAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Please write a reason for the request.');
      return;
    }

    try {
      setSubmittingRequest(true);

      await axios.post(
        `${API_BASE_URL}/api/Child/FundRequests`,
        {
          amount: requestAmount,
          reason: reason.trim(),
        },
        { withCredentials: true }
      );

      setMessage('Money request sent to parent.');
      setAmount('');
      setReason('');
      setShowRequestForm(false);
    } catch (error) {
      console.error('Money request error:', error);

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to send money request.'
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleMakePayment = async (event) => {
    event.preventDefault();

    const amount = Number(paymentAmount);
    setMessage('');
    setErrorMessage('');

    if (!paymentCategory) {
      setErrorMessage('Please select a spending category.');
      return;
    }

    if (!paymentAmount || Number.isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }

    try {
      setSubmittingPayment(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/Child/MakePayment`,
        {
          category: paymentCategory,
          amount,
        },
        { withCredentials: true }
      );

      if (!response.data?.url) {
        setErrorMessage('Payment session URL was not returned.');
        return;
      }

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Child payment error:', error);

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to start payment.'
      );
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
          Child Wallet
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Balance Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your available balance and request extra money from your parent.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          label="Current Balance"
          value={fetchingWallet ? 'Loading...' : `$${currentBalance.toFixed(2)}`}
          helper="Available money in your wallet"
          tone="emerald"
        />

        <StatCard
          label="Current Month Expense"
          value={fetchingWallet ? 'Loading...' : `$${monthlyExpense.toFixed(2)}`}
          helper="Total spending this month"
          tone="rose"
        />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-600">Request Money</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Ask Parent</h2>
            <p className="mt-1 text-sm text-slate-500">Need extra money?</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowRequestForm(true);
              setMessage('');
            }}
            className="w-full cursor-pointer rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 active:scale-[0.98]"
          >
            Request Money
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-600">Make Payment</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Pay Now</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a spending category before paying.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowPaymentForm(true);
              setMessage('');
            }}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Make Payment
          </button>
        </div>
      </div>

      {showRequestForm && (
        <div className="fixed bottom-0 left-0 right-0 top-20 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm md:left-64">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">Money Request</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Ask Parent</h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRequestForm(false);
                  setAmount('');
                  setReason('');
                }}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                X
              </button>
            </div>

            <form onSubmit={handleRequestMoney} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Amount</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Reason</label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Write why you need money"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm(false);
                    setAmount('');
                    setReason('');
                  }}
                  disabled={submittingRequest}
                  className="flex-1 cursor-pointer rounded-lg bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="flex-1 cursor-pointer rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingRequest ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="fixed bottom-0 left-0 right-0 top-20 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm md:left-64">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">Payment</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Make Payment</h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentAmount('');
                  setPaymentCategory('');
                }}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                X
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Spending Category
                </label>
                <select
                  value={paymentCategory}
                  onChange={(event) => setPaymentCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select category</option>
                  {spendingCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentAmount('');
                    setPaymentCategory('');
                    setErrorMessage('');
                  }}
                  disabled={submittingPayment}
                  className="flex-1 cursor-pointer rounded-lg bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingPayment ? 'Redirecting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildBalance;
