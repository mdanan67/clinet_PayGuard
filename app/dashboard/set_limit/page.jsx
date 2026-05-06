'use client'

import { useState } from 'react'

const initialCategoryLimits = [
  { id: 1, name: 'Food', amount: 200 },
  { id: 2, name: 'Education', amount: 300 },
  { id: 3, name: 'Transport', amount: 150 },
  { id: 4, name: 'Entertainment', amount: 100 },
  { id: 5, name: 'Shopping', amount: 250 },
]

const Page = () => {
  const [categoryLimits, setCategoryLimits] = useState(initialCategoryLimits)
  const [editingId, setEditingId] = useState(null)
  const [editAmount, setEditAmount] = useState('')

  const handleEdit = (category) => {
    setEditingId(category.id)
    setEditAmount(category.amount)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditAmount('')
  }

  const handleSave = (categoryId) => {
    const nextAmount = Number(editAmount)

    if (!editAmount || Number.isNaN(nextAmount) || nextAmount < 0) {
      alert('Please enter a valid amount')
      return
    }

    setCategoryLimits((prevLimits) =>
      prevLimits.map((category) =>
        category.id === categoryId
          ? { ...category, amount: nextAmount }
          : category
      )
    )

    setEditingId(null)
    setEditAmount('')
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Set Spending Limits</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage how much can be spent in each category.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_180px] gap-4 bg-gray-100 px-6 py-4 text-sm font-semibold text-gray-600">
          <span>Category</span>
          <span>Limit</span>
          <span className="text-right">Action</span>
        </div>

        <div className="divide-y divide-gray-100">
          {categoryLimits.map((category) => {
            const isEditing = editingId === category.id

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
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-gray-900">
                      ${category.amount}
                    </span>
                  )}
                </div>

                <div className="flex justify-start gap-3 md:justify-end">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave(category.id)}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
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
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Page
