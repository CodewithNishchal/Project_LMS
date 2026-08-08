import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useBorrowerDashboard } from '../../hooks/useDashboardPolling';
import { Link, useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  FileText,
  PlusCircle,
  Loader2,
  AlertTriangle,
  X,
  Info,
  ChevronRight,
  PartyPopper,
  Zap,
  Landmark,
} from 'lucide-react';

const getUtrString = (activeLoan: any): string => {
  if (!activeLoan) return '';
  const rawUtr = activeLoan.disbursedUtr;

  if (rawUtr) {
    if (typeof rawUtr === 'object') {
      const extracted = rawUtr.utrNumber || rawUtr.utr || rawUtr.value || '';
      if (extracted && String(extracted) !== '[object Object]') {
        return String(extracted).trim();
      }
    }
    const str = String(rawUtr).trim();
    if (str && str !== '[object Object]') {
      return str;
    }
  }

  // Fallback: Extract UTR number from auditTrail notes if disbursedUtr was stored as [object Object]
  const disbAudit = activeLoan.auditTrail?.find((a: any) =>
    a.action?.includes('DISBURSEMENT_RELEASED') || a.action?.includes('DISBURSED')
  );
  if (disbAudit?.notes) {
    const match = disbAudit.notes.match(/UTR\s*#?\s*([A-Za-z0-9]+)/i);
    if (match && match[1] && match[1].toLowerCase() !== 'object') {
      return match[1];
    }
  }

  return '';
};

export const BorrowerDashboard: React.FC = () => {
  const [activeLoanAlert, setActiveLoanAlert] = useState(false);
  const [statusToast, setStatusToast] = useState<{
    title: string;
    message: string;
    type: 'sanction' | 'disburse' | 'closed' | 'reject';
  } | null>(null);

  const prevStatusRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { data, isLoading, error } = useBorrowerDashboard();

  const activeLoan = data?.activeLoan || data?.loan;
  const payments = data?.payments || [];
  const cleanUtr = getUtrString(activeLoan);

  // Detect Live Status Transitions via 10s Polling and Show Toast Notification
  useEffect(() => {
    if (activeLoan?.status) {
      if (prevStatusRef.current && prevStatusRef.current !== activeLoan.status) {
        let toastData = null;

        if (activeLoan.status === 'SANCTIONED') {
          toastData = {
            title: 'Loan Application Sanctioned!',
            message: 'Your personal loan has been approved by Credit Underwriting. Disbursal payout is currently in progress.',
            type: 'sanction' as const,
          };
        } else if (activeLoan.status === 'DISBURSED') {
          toastData = {
            title: 'Funds Disbursed to Bank Account!',
            message: `₹${(activeLoan.principalAmount || 0).toLocaleString('en-IN')} has been disbursed via UTR #${cleanUtr || 'N/A'}.`,
            type: 'disburse' as const,
          };
        } else if (activeLoan.status === 'CLOSED') {
          toastData = {
            title: 'Loan Repaid & Settled!',
            message: 'Congratulations! Your loan balance is ₹0 and your account is settled. You are eligible to apply for your next loan.',
            type: 'closed' as const,
          };
        } else if (activeLoan.status === 'REJECTED') {
          toastData = {
            title: 'Application Status: REJECTED',
            message: 'Underwriting or Disbursal desk updated your application status. See decision remarks below.',
            type: 'reject' as const,
          };
        }

        if (toastData) {
          setStatusToast(toastData);
          setTimeout(() => setStatusToast(null), 14000);
        }
      }
      prevStatusRef.current = activeLoan.status;
    }
  }, [activeLoan?.status, cleanUtr]);

  const handleApplyClick = (e: React.MouseEvent) => {
    if (activeLoan && activeLoan.status !== 'CLOSED' && activeLoan.status !== 'REJECTED') {
      e.preventDefault();
      setActiveLoanAlert(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />

      {/* LIVE STATUS CHANGE NOTIFICATION TOAST */}
      {statusToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl border border-slate-700/90 max-w-md w-full animate-fade-in-up flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 mt-0.5 shadow-inner ${
              statusToast.type === 'sanction'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : statusToast.type === 'disburse'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : statusToast.type === 'closed'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {statusToast.type === 'sanction' && <Zap className="w-6 h-6 fill-current" />}
            {statusToast.type === 'disburse' && <Landmark className="w-6 h-6" />}
            {statusToast.type === 'closed' && <PartyPopper className="w-6 h-6 text-emerald-400" />}
            {statusToast.type === 'reject' && <AlertTriangle className="w-6 h-6" />}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-base tracking-tight text-white leading-snug">
                {statusToast.title}
              </h4>
              <button
                onClick={() => setStatusToast(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-2 -mt-1"
                title="Dismiss"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {statusToast.message}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-blue-400">
                Detected via Live 5s Polling
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-6">
        {/* Header Title & CTA Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Borrower Dashboard</h1>
            <p className="text-sm text-slate-500">Track active loan status, repayments & KFS details</p>
          </div>
          <Link
            to="/apply"
            onClick={handleApplyClick}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Apply for Next Loan
          </Link>
        </div>

        {/* ACTIVE LOAN BLOCKING ALERT MODAL */}
        {activeLoanAlert && activeLoan && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Active Loan Application Found</h3>
                    <p className="text-xs text-slate-500">Multiple active applications are not permitted</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveLoanAlert(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium space-y-2">
                <p>
                  You currently have an active loan application with status{' '}
                  <strong className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-bold">{activeLoan.status}</strong>.
                </p>
                <p>
                  As per lending regulations, borrowers can only submit a new loan application once their active loan is either{' '}
                  <strong>CLOSED</strong> (repaid in full) or <strong>REJECTED</strong>.
                </p>
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={() => setActiveLoanAlert(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Understand & Close
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching loan details...
          </div>
        ) : error || !activeLoan ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-slate-800">No Active Loan Found</h3>
            <p className="text-sm text-slate-500">You currently have no active loan application under review or disbursed.</p>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md"
            >
              Start Loan Application
            </Link>
          </div>
        ) : (
          <>
            {/* EXPLICIT REJECTION BANNER & REMARKS DISPLAY */}
            {activeLoan.status === 'REJECTED' && (
              <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl space-y-3 animate-fade-in-up shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-900">Application Status: REJECTED</h3>
                    <p className="text-xs text-rose-700 font-medium">
                      Your loan application could not be approved during underwriting or disbursement verification.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/80 rounded-xl border border-rose-200 text-xs space-y-1 text-slate-800">
                  <span className="font-bold text-rose-900 block uppercase tracking-wider text-[10px]">
                    Decision Remarks & Reason:
                  </span>
                  <p className="font-semibold text-slate-800 text-sm">
                    {activeLoan.auditTrail?.[activeLoan.auditTrail.length - 1]?.notes ||
                      'Application did not meet bank underwriting criteria or document verification failed.'}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/apply"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Re-Apply with Updated Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* EXPLICIT CLOSED LOAN SETTLED SUCCESS BANNER */}
            {activeLoan.status === 'CLOSED' && (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-3 animate-fade-in-up shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <PartyPopper className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-emerald-950">Loan Fully Settled & Closed!</h3>
                      <p className="text-xs text-emerald-700 font-medium">
                        Congratulations! Your loan has been 100% repaid. Outstanding balance is ₹0.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/apply"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    Apply for Next Loan <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Loan Balance Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Remaining Balance
                </span>
                <div className="text-3xl font-black text-blue-600 flex items-center">
                  <IndianRupee className="w-7 h-7" />
                  {Math.max(0, (activeLoan.totalRepayment || 0) - activeLoan.totalPaidAmount).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Total Repayment: ₹{(activeLoan.totalRepayment || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Repaid</span>
                <div className="text-3xl font-black text-emerald-600 flex items-center">
                  <IndianRupee className="w-7 h-7" />
                  {activeLoan.totalPaidAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-emerald-600 font-medium pt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {payments.length} Payments Recorded
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Loan Status & Terms
                </span>
                <div className="pt-1">
                  <StatusBadge status={activeLoan.status} />
                </div>
                <p className="text-xs text-slate-500 pt-2 font-medium">
                  {activeLoan.tenureDays && activeLoan.interestRate
                    ? `Tenure: ${activeLoan.tenureDays} Days @ ${activeLoan.interestRate}% p.a.`
                    : 'Tenure: —'}
                </p>
              </div>
            </div>

            {/* Active Loan Details & Payments Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" /> Payment & Repayment History
                  </h3>
                </div>
                <div className="divide-y text-sm">
                  {payments.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">No repayment payments recorded yet.</div>
                  ) : (
                    payments.map((p: any) => (
                      <div key={p._id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">Payment via UTR #{p.utrNumber}</p>
                          <p className="text-xs text-slate-400">Date: {new Date(p.paymentDate).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-emerald-600 text-base">
                          +₹{p.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" /> Account Snapshot
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Loan ID</span>
                    <span className="font-bold text-slate-800 font-mono text-xs">{activeLoan._id as any}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bank UTR</span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {cleanUtr ? `UTR #${cleanUtr}` : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/90 rounded-xl text-slate-600 text-xs flex items-start gap-2.5 border border-slate-200/80 shadow-2xs">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    Bank transfer UTR reference will be updated here once funds are disbursed to your account.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
