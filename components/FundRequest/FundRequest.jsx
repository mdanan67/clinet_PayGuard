'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

const statusStyles = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Canceled: 'border-rose-200 bg-rose-50 text-rose-700',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount || 0));

const formatDateTime = (value) => {
  if (!value) return 'Not available';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const FundRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingRequestId, setActingRequestId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === 'Pending').length,
    [requests]
  );

  const pendingAmount = useMemo(
    () =>
      requests
        .filter((request) => request.status === 'Pending')
        .reduce((total, request) => total + Number(request.amount || 0), 0),
    [requests]
  );

  const loadFundRequests = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await axios.get(`${API_BASE_URL}/api/Parent/FundRequests`, {
        withCredentials: true,
      });

      setRequests(response.data?.requests || []);
    } catch (error) {
      console.error('Fund request load error:', error);

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to load fund requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFundRequests();
  }, []);

  const handleRequestAction = async (requestId, action) => {
    try {
      setActingRequestId(requestId);
      setMessage('');
      setErrorMessage('');

      const response = await axios.post(
        `${API_BASE_URL}/api/Parent/FundRequests/${requestId}/${action}`,
        {},
        { withCredentials: true }
      );

      setMessage(response.data?.message || `Request ${action}d successfully.`);
      await loadFundRequests();
    } catch (error) {
      console.error(`Fund request ${action} error:`, error);

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.response?.data?.title ||
          error.response?.data?.detail ||
          error.message ||
          `Failed to ${action} request.`
      );
    } finally {
      setActingRequestId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">
            Fund Requests
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Child Money Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review requests from your children and approve wallet transfers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Pending
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">{pendingCount}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Requested
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">
              {formatCurrency(pendingAmount)}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-bold text-slate-900">Requests</h2>
          <button
            type="button"
            onClick={loadFundRequests}
            disabled={loading}
            className="cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm font-medium text-slate-500">Loading fund requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-sm font-medium text-slate-500">
            No fund requests have been sent yet.
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {requests.map((request) => {
              const isPending = request.status === 'Pending';
              const isActing = actingRequestId === request.id;

              return (
                <div
                  key={request.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-extrabold text-blue-700">
                          {request.childName?.trim()?.charAt(0)?.toUpperCase() || 'C'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-950">
                              {request.childName}
                            </p>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                statusStyles[request.status] || statusStyles.Pending
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {request.childEmail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                          Request Message
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                          {request.reason || 'No message was added with this request.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Amount
                        </p>
                        <p className="mt-1 text-xl font-extrabold text-slate-950">
                          {formatCurrency(request.amount)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Time / Date
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDateTime(request.createdAt)}
                        </p>
                      </div>

                      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request.id, 'cancel')}
                          disabled={!isPending || isActing}
                          className="flex-1 cursor-pointer rounded-lg bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request.id, 'approve')}
                          disabled={!isPending || isActing}
                          className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isActing ? 'Working...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundRequest;
