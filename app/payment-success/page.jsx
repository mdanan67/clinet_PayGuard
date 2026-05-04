'use client';

import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('Verifying your payment...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('');
        setError('Payment session was not found.');
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:5080/api/Payment/verify-session',
          {
            params: { sessionId },
            withCredentials: true,
          }
        );

        setStatus(
          response.data?.message ||
            `Payment successful. Added $${Number(response.data?.amount || 0).toFixed(2)}.`
        );

        setTimeout(() => {
          router.replace('/dashboard');
        }, 1800);
      } catch (err) {
        setStatus('');
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Payment verification failed.'
        );
      }
    };

    verifyPayment();
  }, [router, sessionId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          {error ? 'Payment Needs Attention' : 'Payment Processing'}
        </h1>

        {status && (
          <p className="mt-4 text-sm font-medium text-slate-600">{status}</p>
        )}

        {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

        <button
          type="button"
          onClick={() => router.replace('/dashboard')}
          className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </section>
    </main>
  );
}
