'use client';

import axios from 'axios';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5080';

const SPENDING_LIMIT_API_URL = `${API_BASE_URL}/api/Parent/spending-limit`;

const initialCategoryLimits = [
  { id: 1, name: 'Food', amount: 200 },
  { id: 2, name: 'Education', amount: 300 },
  { id: 3, name: 'Transport', amount: 150 },
  { id: 4, name: 'Entertainment', amount: 100 },
  { id: 5, name: 'Shopping', amount: 250 },
  { id: 6, name: 'Subscriptions', amount: 80 },
  { id: 7, name: 'Mobile & Internet', amount: 100 },
  { id: 8, name: 'Others', amount: 100 },
];

const Page = () => {
  const [categoryLimits, setCategoryLimits] = useState(initialCategoryLimits);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditAmount(category.amount);
    setMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const handleSave = async (category) => {
    const nextAmount = Number(editAmount);

    if (!editAmount || Number.isNaN(nextAmount) || nextAmount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setSavingId(category.id);
      setMessage('');
      setErrorMessage('');

      await axios.post(
        SPENDING_LIMIT_API_URL,
        {
          categoryId: category.id,
          categoryName: category.name,
          amount: nextAmount,
        },
        { withCredentials: true }
      );

      setCategoryLimits((prevLimits) =>
        prevLimits.map((limit) =>
          limit.id === category.id ? { ...limit, amount: nextAmount } : limit
        )
      );

      setEditingId(null);
      setEditAmount('');
      setMessage(`${category.name} limit saved successfully`);
    } catch (error) {
      console.error('Spending limit save error:', error);
      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to save spending limit'
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Set Spending Limits</h1>
        <p className="mt-2 text-sm text-gray-500">Manage how much can be spent in each category.</p>
      </div>

      {message && (
        <div className="mb-5 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_180px] gap-4 bg-gray-100 px-6 py-4 text-sm font-semibold text-gray-600">
          <span>Category</span>
          <span>Limit</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-gray-100">
          {categoryLimits.map((category) => {
            const isEditing = editingId === category.id;

            return (
              <div
                key={category.id}
                className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-[1fr_140px_180px] md:items-center"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{category.name}</h2>
                  <p className="text-sm text-gray-500">Monthly spending category</p>
                </div>

                <div>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-gray-900">${category.amount}</span>
                  )}
                </div>

                <div className="flex justify-start gap-3 md:justify-end">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave(category)}
                        disabled={savingId === category.id}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === category.id ? 'Saving...' : 'Save'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={savingId === category.id}
                        className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page;
