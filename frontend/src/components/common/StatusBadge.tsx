import React from 'react';
import { LoanStatus } from '../../types';

interface Props {
  status: LoanStatus | string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case LoanStatus.LEAD:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case LoanStatus.APPLIED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case LoanStatus.SANCTIONED:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case LoanStatus.DISBURSED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case LoanStatus.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case LoanStatus.CLOSED:
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {status}
    </span>
  );
};
