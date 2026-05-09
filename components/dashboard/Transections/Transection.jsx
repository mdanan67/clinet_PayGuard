import React from 'react';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Failed: 'bg-red-50 text-red-700 ring-red-200',
};

const formatAmount = (amount) => `$${Number(amount ?? 0).toFixed(2)}`;

const formatDate = (date) => {
  if (!date) {
    return 'N/A';
  }

  return new Date(date).toLocaleString();
};

const shortId = (id) => {
  if (!id) {
    return '-';
  }

  return `${id.slice(0, 8)}...`;
};

const EmptyValue = () => <span className="text-slate-400">null</span>;

const Transection = ({
  id,
  senderWalletId,
  receiverWalletId,
  amount,
  type,
  status,
  stripePaymentIntentId,
  stripeChargeId,
  failureReason,
  createdAt,
  updatedAt,
}) => {
  const statusClass = statusStyles[status] || 'bg-slate-50 text-slate-700 ring-slate-200';
  const isFailed = status === 'Failed';

  return (
    <tr className="group border-b border-slate-100 bg-white text-base transition hover:bg-slate-50/80">
      <td className="px-4 py-5 whitespace-nowrap">
        <div className="font-bold text-slate-900">{shortId(id)}</div>
        <div className="mt-1 text-sm text-slate-400">Transaction ID</div>
      </td>

      <td className="px-4 py-5 whitespace-nowrap">
        <span className="font-mono text-sm font-semibold text-slate-600">
          {shortId(senderWalletId)}
        </span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap">
        <span className="font-mono text-sm font-semibold text-slate-600">
          {shortId(receiverWalletId)}
        </span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap">
        <span className={`font-bold ${isFailed ? 'text-red-600' : 'text-slate-950'}`}>
          {formatAmount(amount)}
        </span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap">
        <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
          {type || 'Unknown'}
        </span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap">
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${statusClass}`}>
          {status || 'Unknown'}
        </span>
      </td>

      <td className="px-4 py-5 whitespace-nowrap text-slate-600">{formatDate(createdAt)}</td>
      <td className="px-4 py-5 whitespace-nowrap text-slate-500">{updatedAt ? formatDate(updatedAt) : <EmptyValue />}</td>
      <td className="px-4 py-5 whitespace-nowrap font-mono text-sm text-slate-500">
        {stripePaymentIntentId || <EmptyValue />}
      </td>
      <td className="px-4 py-5 whitespace-nowrap font-mono text-sm text-slate-500">
        {stripeChargeId || <EmptyValue />}
      </td>
      <td className="px-4 py-5 whitespace-nowrap">
        {failureReason ? (
          <span className="font-medium text-red-600">{failureReason}</span>
        ) : (
          <EmptyValue />
        )}
      </td>
    </tr>
  );
};

export default Transection;
