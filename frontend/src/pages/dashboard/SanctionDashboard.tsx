import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DecisionModal } from '../../components/dashboard/DecisionModal';
import { useSanctionActionableQueue, useSanctionHistoryQueue } from '../../hooks/useDashboardPolling';
import { api } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, RefreshCcw, ShieldCheck, History, Loader2, FileText, ExternalLink } from 'lucide-react';

export const SanctionDashboard: React.FC = () => {
  const [tab, setTab] = useState<'ACTIONABLE' | 'HISTORY'>('ACTIONABLE');
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: actionableLoans = [], isLoading: loadingActionable } = useSanctionActionableQueue();
  const { data: historyLogs = [], isLoading: loadingHistory } = useSanctionHistoryQueue();

  const handleDecision = async (decision: 'APPROVE' | 'REJECT', notes: string) => {
    if (!selectedLoan) return;
    await api.post('/sanction/decide', {
      loanId: selectedLoan._id,
      decision,
      notes,
    });
    queryClient.invalidateQueries({ queryKey: ['sanctionQueue'] });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sanction Underwriting Dashboard</h1>
            <p className="text-sm text-slate-500">Credit Risk & BRE Underwriting Queue</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border">
            <RefreshCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Live 5s Polling
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setTab('ACTIONABLE')}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'ACTIONABLE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Actionable Queue ({actionableLoans.length})
          </button>
          <button
            onClick={() => setTab('HISTORY')}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'HISTORY'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" /> Team Audit History ({historyLogs.length})
          </button>
        </div>

        {tab === 'ACTIONABLE' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loadingActionable ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching underwriting queue...
              </div>
            ) : actionableLoans.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No applications waiting for sanction.</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold whitespace-nowrap">Loan ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Borrower</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Monthly Income</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Principal / Total Repayment</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Salary Slip Proof</th>
                    <th className="p-4 font-semibold whitespace-nowrap">BRE Status</th>
                    <th className="p-4 font-semibold text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {actionableLoans.map((loan: any) => (
                    <tr key={loan._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 text-xs font-mono whitespace-nowrap">{loan._id}</td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{loan.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">PAN: {loan.pan || 'N/A'}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 whitespace-nowrap">
                        ₹{(loan.monthlySalary || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-blue-600">₹{(loan.principalAmount || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-emerald-700 font-bold">
                          Total: ₹{(loan.totalRepayment || (loan.principalAmount * 1.06)).toLocaleString('en-IN')}
                        </p>
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
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {loan.breStatus || 'PASSED'}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap"
                        >
                          Underwrite & Decide
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
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching sanction history...
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No historical decision logs recorded yet.</div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-4 font-semibold whitespace-nowrap">Loan ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Borrower</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Salary Slip Proof</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Sanction Officer & Decision Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {historyLogs.map((log: any) => {
                    // Extract specifically the SANCTION audit entry for this loan
                    const sanctionAudit = log.auditTrail?.find((a: any) => a.action?.includes('SANCTION')) || log.auditTrail?.[0];
                    return (
                      <tr key={log._id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900 text-xs font-mono whitespace-nowrap">{log._id}</td>
                        <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{log.fullName}</td>
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
                        <td className="p-4 text-xs text-slate-700 font-medium">
                          {sanctionAudit?.notes ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-800">{sanctionAudit.notes}</p>
                              {(sanctionAudit.performedByEmail || sanctionAudit.performedBy) && (
                                <p className="text-[11px] text-blue-600 font-mono font-semibold">
                                  Sanction Officer: {sanctionAudit.performedBy || 'Officer'} ({sanctionAudit.performedByEmail || 'sanction@creditsea.com'})
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Sanction Decision Processed</span>
                          )}
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
          organizationName={selectedLoan.organizationName}
          mode="SANCTION"
          onClose={() => setModalOpen(false)}
          onConfirm={handleDecision}
        />
      )}
    </div>
  );
};
