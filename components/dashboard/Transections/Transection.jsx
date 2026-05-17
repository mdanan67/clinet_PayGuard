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
    return 'N/A';
  }

  return `${id.slice(0, 8)}...`;
};

const EmptyValue = () => <span className="text-slate-400">N/A</span>;

const PersonName = ({ name, fallback }) => (
  <div className="min-w-[120px]">
    <p className="truncate text-sm font-bold text-slate-900">
      {name || <EmptyValue />}
    </p>
    {!name && (
      <TruncatedId value={fallback} />
    )}
  </div>
);

const TruncatedId = ({ value }) => (
  <span className="block max-w-[170px] truncate font-mono text-xs text-slate-600" title={value || 'N/A'}>
    {value ? shortId(value) : <EmptyValue />}
  </span>
);

const Transection = ({
  id,
  senderName,
  senderWalletId,
  receiverWalletId,
  amount,
  category,
  type,
  status,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  stripeChargeId,
  failureReason,
  createdAt,
  updatedAt,
}) => {
  const statusClass = statusStyles[status] || 'bg-slate-50 text-slate-700 ring-slate-200';
  const isFailed = status === 'Failed';

  return (
    <tr className="border-b border-slate-100 bg-white text-sm transition last:border-b-0 hover:bg-slate-50">
      <td className="px-4 py-4">
        <TruncatedId value={id} />
      </td>

      <td className="px-4 py-4">
        <PersonName name={senderName} fallback={senderWalletId} />
      </td>

      <td className="px-4 py-4">
        <TruncatedId value={receiverWalletId} />
      </td>

      <td className={`px-4 py-4 font-bold ${isFailed ? 'text-red-600' : 'text-slate-950'}`}>
        {formatAmount(amount)}
      </td>

      <td className="px-4 py-4">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {type || 'Unknown'}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass}`}>
          {status || 'Unknown'}
        </span>
      </td>

      <td className="px-4 py-4 text-slate-600">{category || <EmptyValue />}</td>
      <td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(createdAt)}</td>
      <td className="px-4 py-4 whitespace-nowrap text-slate-500">
        {updatedAt ? formatDate(updatedAt) : <EmptyValue />}
      </td>

      <td className="px-4 py-4">
        <TruncatedId value={stripeCheckoutSessionId} />
      </td>

      <td className="px-4 py-4">
        <TruncatedId value={stripePaymentIntentId} />
      </td>

      <td className="px-4 py-4">
        <TruncatedId value={stripeChargeId} />
      </td>

      <td className="px-4 py-4">
        <span className="block max-w-[220px] truncate text-sm text-red-600" title={failureReason || 'N/A'}>
          {failureReason || <EmptyValue />}
        </span>
      </td>
    </tr>
  );
};

export default Transection;
