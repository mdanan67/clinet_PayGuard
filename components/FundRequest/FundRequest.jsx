'use client';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';
const PAGE_SIZE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleRequests = requests.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePageNumbers =
    totalPages <= 5
      ? pageNumbers
      : pageNumbers.filter(
          (pageNumber) =>
            pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1
        );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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
    <section className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-slate-50">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
            Allowance Requests
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-slate-950">
            Review money requests from your children
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2">
            <span className="text-[11px] font-bold text-amber-700">Pending </span>
            <span className="text-xs font-extrabold text-slate-950">{pendingCount}</span>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2">
            <span className="text-[11px] font-bold text-indigo-700">Pending total </span>
            <span className="text-xs font-extrabold text-slate-950">
              {formatCurrency(pendingAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={loadFundRequests}
            disabled={loading}
            className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {message && (
        <div className="mx-4 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 sm:mx-6 lg:mx-8">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-6 lg:mx-8">
          {errorMessage}
        </div>
      )}

      <div className="min-h-0 flex-1 p-4 sm:p-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="h-11 w-11 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-64 max-w-full rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-24 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="grid min-h-[360px] place-items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="max-w-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-600">
                $
              </div>
              <p className="mt-4 text-base font-bold text-slate-900">No allowance requests yet</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                New child money requests will appear here for approval or cancellation.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-0">
            <div className="space-y-3">
              {visibleRequests.map((request) => {
                const isPending = request.status === 'Pending';
                const isActing = actingRequestId === request.id;

                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">
                            {request.childName?.trim()?.charAt(0)?.toUpperCase() || 'C'}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-[11px] font-bold text-slate-950">
                                {request.childName || 'Child account'}
                              </p>
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                                  statusStyles[request.status] || statusStyles.Pending
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                              {request.childEmail || 'No email available'}
                            </p>
                          </div>
                        </div>

                        <p className="mt-2.5 line-clamp-2 text-[11px] leading-5 text-slate-600">
                          {request.reason || 'No message was added with this request.'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:w-[420px] xl:justify-end">
                        <div className="min-w-[150px]">
                          <p className="text-sm font-extrabold text-slate-950">
                            {formatCurrency(request.amount)}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500">
                            {formatDateTime(request.createdAt)}
                          </p>
                        </div>

                        <div className="flex gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleRequestAction(request.id, 'cancel')}
                            disabled={!isPending || isActing}
                            className="h-10 cursor-pointer rounded-xl bg-rose-50 px-4 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestAction(request.id, 'approve')}
                            disabled={!isPending || isActing}
                            className="h-10 cursor-pointer rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-sm shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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

            {requests.length > PAGE_SIZE && (
              <div className="mt-5 flex flex-col items-center gap-3 px-4 py-3 text-xs text-slate-600">
                <p className="text-[11px] font-semibold text-slate-500">
                  Showing {pageStartIndex + 1}-
                  {Math.min(pageStartIndex + PAGE_SIZE, requests.length)} of {requests.length}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span aria-hidden="true">&lt;</span>
                    Previous
                  </button>
                  <div className="flex flex-wrap items-center gap-1">
                    {visiblePageNumbers.map((pageNumber, index) => {
                      const previousPageNumber = visiblePageNumbers[index - 1];
                      const showEllipsis =
                        previousPageNumber && pageNumber - previousPageNumber > 1;

                      return (
                        <div key={pageNumber} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="grid h-8 min-w-8 place-items-center text-xs font-bold text-slate-500">
                              ...
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(pageNumber)}
                            aria-current={currentPage === pageNumber ? 'page' : undefined}
                            className={`grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-bold transition ${
                              currentPage === pageNumber
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                : 'border-transparent text-slate-800 hover:border-slate-200 hover:bg-white'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <span aria-hidden="true">&gt;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FundRequest;
