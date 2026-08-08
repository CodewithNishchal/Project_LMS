import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RecordPaymentModal } from '../../components/dashboard/RecordPaymentModal';
import { useCollectionQueue } from '../../hooks/useDashboardPolling';
import { api } from '../../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IndianRupee, History, RefreshCcw, Loader2 } from 'lucide-react';

export const CollectionDashboard: React.FC = () => {
  const [tab, setTab] = useState<'ACTIONABLE' | 'SETTLED'>('ACTIONABLE');
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: activeLoans = [], isLoading: loadingActive } = useCollectionQueue();

  const { data: settledLoans = [], isLoading: loadingSettled } = useQuery({
    queryKey: ['collectionQueue', 'history'],
    queryFn: async () => {
      const res = await api.get('/collection/loans?type=history');
      return res.data;
    },
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Collection & Recovery Dashboard</h1>
            <p className="text-sm text-slate-500">Repayment Entry & Outstanding Balance Queue</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border">
            <RefreshCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Live 5s Polling
          </div>
        </div>

        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setTab('ACTIONABLE')}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'ACTIONABLE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <IndianRupee className="w-4 h-4" /> Active Loans ({activeLoans.length})
          </button>
          <button
            onClick={() => setTab('SETTLED')}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'SETTLED'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" /> Settled / Closed Loans Log ({settledLoans.length})
          </button>
        </div>

        {tab === 'ACTIONABLE' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingActive ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Loading active disbursed loans...
              </div>
            ) : activeLoans.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No active disbursed loans in recovery.</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold">Loan ID</th>
                    <th className="p-4 font-semibold">Borrower</th>
                    <th className="p-4 font-semibold">Total Repayment</th>
                    <th className="p-4 font-semibold">Total Paid</th>
                    <th className="p-4 font-semibold">Outstanding Balance</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {activeLoans.map((loan: any) => {
                    const outstanding = (loan.totalRepayment || 0) - loan.totalPaidAmount;
                    return (
                      <tr key={loan._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900 text-xs font-mono">{loan._id}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{loan.fullName}</p>
                          <p className="text-xs text-slate-400">{loan.phone}</p>
                        </td>
                        <td className="p-4 font-medium text-slate-700">
                          ₹{(loan.totalRepayment || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-bold text-emerald-600">
                          ₹{loan.totalPaidAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-black text-blue-600">
                          ₹{outstanding.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={loan.status} />
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedLoan({ ...loan, outstandingBalance: outstanding });
                              setModalOpen(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                          >
                            Record Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingSettled ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Loading settled loans...
              </div>
            ) : settledLoans.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No closed/settled loans recorded yet.</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold">Loan ID</th>
                    <th className="p-4 font-semibold">Borrower</th>
                    <th className="p-4 font-semibold">Total Paid</th>
                    <th className="p-4 font-semibold">Closed Date</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {settledLoans.map((loan: any) => (
                    <tr key={loan._id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900 text-xs font-mono">{loan._id}</td>
                      <td className="p-4 font-bold text-slate-800">{loan.fullName}</td>
                      <td className="p-4 font-bold text-emerald-600">₹{loan.totalPaidAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-xs text-slate-500">{loan.closedAt ? new Date(loan.closedAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">
                        <StatusBadge status={loan.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {selectedLoan && modalOpen && (
        <RecordPaymentModal
          loanId={selectedLoan._id}
          borrowerName={selectedLoan.fullName}
          outstandingBalance={selectedLoan.outstandingBalance}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['collectionQueue'] });
          }}
        />
      )}
    </div>
  );
};
