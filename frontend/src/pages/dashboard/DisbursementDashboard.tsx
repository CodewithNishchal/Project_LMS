import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DecisionModal } from '../../components/dashboard/DecisionModal';
import { useDisbursementActionableQueue, useDisbursementHistoryQueue } from '../../hooks/useDashboardPolling';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Landmark, FileText, ExternalLink, RefreshCcw, Loader2 } from 'lucide-react';

export const DisbursementDashboard: React.FC = () => {
  const [tab, setTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: pendingQueue = [], isLoading: loadingPending } = useDisbursementActionableQueue();
  const { data: historyLogs = [], isLoading: loadingHistory } = useDisbursementHistoryQueue();

  const handleDisburse = async (
    decision: 'APPROVE' | 'REJECT',
    notes: string,
    extraData?: any
  ) => {
    if (!selectedLoan) return;

    const actualUtr = typeof extraData === 'object' && extraData !== null ? (extraData.utr || extraData.utrNumber) : extraData;

    if (decision === 'APPROVE') {
      await api.post('/disbursement/release', {
        loanId: selectedLoan._id,
        utrNumber: actualUtr,
        utr: actualUtr,
        notes,
      });
    } else {
      await api.post('/disbursement/reject', {
        loanId: selectedLoan._id,
        notes,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['disbursementQueue'] });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Disbursement Desk Dashboard</h1>
            <p className="text-sm text-slate-500">Fund Transfer & Bank Payout Release Queue</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border">
            <RefreshCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Live 5s Polling
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setTab('PENDING')}
            className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'PENDING'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Landmark className="w-4 h-4" /> Pending Disbursement ({pendingQueue.length})
          </button>
          <button
            onClick={() => setTab('HISTORY')}
            className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'HISTORY'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <RefreshCcw className="w-4 h-4" /> Disbursed History ({historyLogs.length})
          </button>
        </div>

        {/* Queue Content */}
        {tab === 'PENDING' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingPending ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching sanctioned loans queue...
              </div>
            ) : pendingQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No sanctioned loans pending disbursement release.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold whitespace-nowrap">Loan ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Borrower</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Bank Account Details</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Disbursal Amount</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Salary Slip Proof</th>
                    <th className="p-4 font-semibold text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {pendingQueue.map((loan: any) => (
                    <tr key={loan._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 text-xs font-mono whitespace-nowrap">{loan._id}</td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{loan.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{loan.email}</p>
                      </td>
                      <td className="p-4 text-xs whitespace-nowrap">
                        <p className="font-bold text-slate-800">HDFC Bank (A/C: ****4892)</p>
                        <p className="text-[11px] text-slate-400 font-mono">IFSC: HDFC0001234</p>
                      </td>
                      <td className="p-4 font-extrabold text-blue-600 whitespace-nowrap">
                        ₹{(loan.principalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {loan.salarySlipUrl ? (
                          <a
                            href={loan.salarySlipUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200/80 transition-colors whitespace-nowrap shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" /> View Document <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No Slip</span>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setModalOpen(true);
                          }}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap"
                        >
                          Execute Payout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingHistory ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching disbursed history...
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No disbursals executed yet.</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold whitespace-nowrap">Loan ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Borrower</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Disbursed Amount</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Bank UTR</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Disbursement Officer Remarks</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Salary Slip Proof</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Current Loan Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {historyLogs.map((log: any) => {
                    const disbursementAudit = log.auditTrail?.find((a: any) => a.action?.includes('DISBURSEMENT')) || log.auditTrail?.[0];
                    const cleanUtr = log.disbursedUtr && typeof log.disbursedUtr === 'object' ? log.disbursedUtr.utr : log.disbursedUtr;
                    return (
                      <tr key={log._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900 text-xs font-mono whitespace-nowrap">{log._id}</td>
                        <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{log.fullName}</td>
                        <td className="p-4 font-bold text-emerald-600 whitespace-nowrap">
                          ₹{(log.principalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                          {cleanUtr && cleanUtr !== '[object Object]' ? cleanUtr : 'N/A'}
                        </td>
                        <td className="p-4 text-xs text-slate-700 font-medium">
                          {disbursementAudit?.notes ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800">{disbursementAudit.notes}</p>
                              {(disbursementAudit.performedByEmail || disbursementAudit.performedBy) && (
                                <p className="text-[11px] text-blue-600 font-mono font-semibold">
                                  Officer: {disbursementAudit.performedBy || 'Officer'} ({disbursementAudit.performedByEmail || 'disbursement@creditsea.com'})
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Payout Processed</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {log.salarySlipUrl ? (
                            <a
                              href={log.salarySlipUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" /> View Document <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">N/A</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <StatusBadge status={log.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {selectedLoan && (
        <DecisionModal
          isOpen={modalOpen}
          loanId={selectedLoan._id}
          borrowerName={selectedLoan.fullName}
          requestedAmount={selectedLoan.principalAmount || 0}
          totalRepayment={selectedLoan.totalRepayment}
          tenureDays={selectedLoan.tenureDays}
          salarySlipUrl={selectedLoan.salarySlipUrl}
          pan={selectedLoan.pan}
          dob={selectedLoan.dob}
          monthlySalary={selectedLoan.monthlySalary}
          breStatus={selectedLoan.breStatus}
          mode="DISBURSEMENT"
          onClose={() => setModalOpen(false)}
          onConfirm={handleDisburse}
        />
      )}
    </div>
  );
};
