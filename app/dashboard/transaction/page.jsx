'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Transection from '@/components/dashboard/Transections/Transection';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';
const TRANSACTIONS_API_URL = `${API_BASE_URL}/api/Parent/transaction`;

const page = () => {
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
    <div className="min-h-[calc(100vh-96px)] bg-slate-50 p-6">
      <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        </div>

        {loading && <div className="px-6 py-8 text-slate-500">Loading transactions...</div>}

        {!loading && errorMessage && (
          <div className="m-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && transactions.length === 0 && (
          <div className="px-6 py-8 text-slate-500">No transactions found.</div>
        )}

        {!loading && !errorMessage && transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <tbody>
                {transactions.map((transaction) => (
                  <Transection
                    key={transaction.id || transaction.Id}
                    id={transaction.id || transaction.Id}
                    senderWalletId={transaction.senderWalletId || transaction.SenderWalletId}
                    receiverWalletId={transaction.receiverWalletId || transaction.ReceiverWalletId}
                    amount={transaction.amount || transaction.Amount}
                    type={transaction.type || transaction.Type}
                    status={transaction.status || transaction.Status}
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

export default page;
