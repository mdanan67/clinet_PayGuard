'use client';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function StripePaymentForm({ amount, onSuccess, onClose, token }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const handleAddBalance = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create Payment Intent on backend
      const response1 = await fetch('http://localhost:5080/api/balance/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      if (!response1.ok) {
        const errorData = await response1.json();
        setError(errorData.message || 'Failed to create payment intent');
        setLoading(false);
        return;
      }

      const { clientSecret, paymentIntentId: intentId } = await response1.json();
      setPaymentIntentId(intentId);

      // Step 2: Confirm payment with Stripe
      if (!stripe || !elements) {
        setError('Stripe not loaded');
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'User'
          }
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        // Step 3: Confirm payment on backend
        const response2 = await fetch('http://localhost:5080/api/balance/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ paymentIntentId: intentId })
        });

        if (response2.ok) {
          const data = await response2.json();
          onSuccess(data);
        } else {
          const errorData = await response2.json();
          setError(errorData.message || 'Failed to confirm payment');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Add Balance</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-slate-600">Amount:</p>
          <p className="text-3xl font-bold text-blue-600">${parseFloat(amount || 0).toFixed(2)}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Card Details
          </label>
          <div className="p-4 border-2 border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddBalance}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
}
