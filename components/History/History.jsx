'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';
const CHILD_PAYMENT_HISTORY_API_URL = `${API_BASE_URL}/api/Parent/children-payment-transactions`;
const PAGE_SIZE = 10;

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Failed: 'bg-red-50 text-red-700 ring-red-200',
};

const getValue = (item, keys, fallback = '') => {
  for (const key of keys) {
    const value = key.split('.').reduce((current, part) => current?.[part], item);

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallback;
};

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount || 0));

const formatDate = (value) => {
  if (!value) return 'Not available';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const normalizePayment = (payment) => ({
  id: getValue(payment, ['id', 'Id', 'transactionId', 'TransactionId']),
  childName: getValue(
    payment,
    [
      'childName',
      'ChildName',
      'child.name',
      'Child.Name',
      'child.firstName',
      'Child.FirstName',
      'senderName',
      'SenderName',
      'senderFirstName',
      'SenderFirstName',
    ],
    'Child account'
  ),
  amount: getValue(payment, ['amount', 'Amount'], 0),
  category: getValue(payment, ['category', 'Category'], 'Uncategorized'),
  status: getValue(payment, ['status', 'Status'], 'Success'),
  paidAt: getValue(payment, ['paidAt', 'PaidAt', 'createdAt', 'CreatedAt']),
});

const History = ({ transactions }) => {
  const [historyTransactions, setHistoryTransactions] = useState(
    Array.isArray(transactions) ? transactions : []
  );
  const [loading, setLoading] = useState(!Array.isArray(transactions));
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (Array.isArray(transactions)) {
      setHistoryTransactions(transactions);
      setLoading(false);
      setErrorMessage('');
      return;
    }

    const getChildPaymentHistory = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await axios.get(CHILD_PAYMENT_HISTORY_API_URL, {
          withCredentials: true,
        });

        setHistoryTransactions(response.data?.transactions || []);
      } catch (error) {
        console.error('Child payment history load error:', error);
        setErrorMessage(
          error.response?.data?.error ||
            error.response?.data?.message ||
            'Failed to load child payment history'
        );
      } finally {
        setLoading(false);
      }
    };

    getChildPaymentHistory();
  }, [transactions]);

  const payments = historyTransactions.map(normalizePayment);
  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(1);
  const pageStartIndex = (currentPage - 1) * PAGE_SIZE;
  const visiblePayments = payments.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <section className="flex w-full min-w-0 flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-6">
        <h1 className="mt-1 text-xl font-bold leading-tight text-slate-950">
          Recent child spending's
        </h1>
        <p className="mt-1 text-sm text-slate-500">Review each child payment</p>
      </div>

      <div className="min-h-0 w-full min-w-0 flex-1 py-5">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">
            Loading child payment history...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && payments.length > 0 && (
          <div className=" border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] table-fixed">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <th className="w-[28%] px-4 py-3">Child</th>
                    <th className="w-[16%] px-4 py-3">Amount</th>
                    <th className="w-[18%] px-4 py-3">Category</th>
                    <th className="w-[24%] px-4 py-3">Date</th>
                    <th className="w-[14%] px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePayments.map((payment) => (
                    <tr
                      key={payment.id || `${payment.childName}-${payment.paidAt}-${payment.amount}`}
                      className="border-b border-slate-100 text-sm last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-bold text-slate-950">{payment.childName}</td>
                      <td className="px-4 py-4 font-extrabold text-slate-950">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                          {payment.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {formatDate(payment.paidAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                            statusStyles[payment.status] || statusStyles.Success
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {payments.length > PAGE_SIZE && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {pageStartIndex + 1}-
                  {Math.min(pageStartIndex + PAGE_SIZE, payments.length)} of {payments.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-sm font-semibold text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
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

export default History;
