'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Transection from '@/components/dashboard/Transections/Transection';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';
const TRANSACTIONS_API_URL = `${API_BASE_URL}/api/Parent/transaction`;

const getSenderFirstName = (transaction) =>
  transaction.senderFirstName ||
  transaction.SenderFirstName ||
  transaction.senderUserFirstName ||
  transaction.SenderUserFirstName ||
  transaction.sender?.firstName ||
  transaction.Sender?.FirstName ||
  transaction.senderUser?.firstName ||
  transaction.SenderUser?.FirstName ||
  transaction.senderWallet?.user?.firstName ||
  transaction.SenderWallet?.User?.FirstName ||
  '';

const Page = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const getTransactions = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const response = await axios.get(TRANSACTIONS_API_URL, {
          withCredentials: true,
        });

        setTransactions(response.data?.transactions || []);
      } catch (error) {
        console.error('Transaction load error:', error);
        setErrorMessage(
          error.response?.data?.error ||
            error.response?.data?.message ||
            'Failed to load transactions'
        );
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, []);

  return (
    <div className="-mx-4 -my-5 min-h-[calc(100vh-4rem)] w-[calc(100%+2rem)] bg-slate-50 sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-slate-50">
        <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Transaction History
          </p>
          <h1 className="text-xl font-bold leading-tight text-slate-950">
            Review wallet and payment activity
          </h1>
        </div>

        {loading && (
          <div className="p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500 shadow-sm">
              Loading transactions...
            </div>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && transactions.length === 0 && (
          <div className="grid min-h-[360px] place-items-center p-5 text-center">
            <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-lg font-bold text-indigo-600">
                $
              </div>
              <p className="mt-4 text-base font-bold text-slate-900">
                No transactions found
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Wallet transfers and payment records will appear here.
              </p>
            </div>
          </div>
        )}

        {!loading && !errorMessage && transactions.length > 0 && (
          <div className="min-h-0 flex-1 overflow-x-auto p-4 sm:p-5">
            <table className="w-full min-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Receiver Wallet</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Updated At</th>
                  <th className="px-4 py-3">Checkout Session</th>
                  <th className="px-4 py-3">Payment Intent</th>
                  <th className="px-4 py-3">Stripe Charge</th>
                  <th className="px-4 py-3">Failure Reason</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <Transection
                    key={transaction.id || transaction.Id}
                    id={transaction.id || transaction.Id}
                    senderName={getSenderFirstName(transaction)}
                    senderWalletId={transaction.senderWalletId || transaction.SenderWalletId}
                    receiverWalletId={transaction.receiverWalletId || transaction.ReceiverWalletId}
                    amount={transaction.amount || transaction.Amount}
                    category={transaction.category || transaction.Category}
                    type={transaction.type || transaction.Type}
                    status={transaction.status || transaction.Status}
                    stripeCheckoutSessionId={
                      transaction.stripeCheckoutSessionId || transaction.StripeCheckoutSessionId
                    }
                    stripePaymentIntentId={
                      transaction.stripePaymentIntentId || transaction.StripePaymentIntentId
                    }
                    stripeChargeId={transaction.stripeChargeId || transaction.StripeChargeId}
                    failureReason={transaction.failureReason || transaction.FailureReason}
                    createdAt={transaction.createdAt || transaction.CreatedAt}
                    updatedAt={transaction.updatedAt || transaction.UpdatedAt}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
