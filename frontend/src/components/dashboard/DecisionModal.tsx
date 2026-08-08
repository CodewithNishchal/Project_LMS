import React, { useState, useEffect, PropsWithChildren } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Loader2, FileText, ExternalLink, User } from 'lucide-react';
import { api } from '../../services/api';

interface DecisionModalProps {
  isOpen: boolean;
  loanId: string;
  borrowerName: string;
  requestedAmount: number;
  totalRepayment?: number | null;
  tenureDays?: number | null;
  salarySlipUrl?: string | null;
  pan?: string | null;
  dob?: string | Date | null;
  monthlySalary?: number | null;
  breStatus?: string | null;
  mode: 'SANCTION' | 'DISBURSEMENT';
  onClose: () => void;
  onConfirm: (decision: 'APPROVE' | 'REJECT', notes: string, extraData?: any) => Promise<void>;
}

export const DecisionModal: React.FC<PropsWithChildren<DecisionModalProps>> = ({
  isOpen,
  loanId,
  borrowerName,
  requestedAmount,
  totalRepayment,
  tenureDays,
  salarySlipUrl,
  pan,
  dob,
  monthlySalary,
  breStatus,
  mode,
  onClose,
  onConfirm,
}) => {
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Credit Risk Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'SANCTION' && loanId) {
      setAiLoading(true);
      api.post('/sanction/ai-analyze', { loanId })
        .then((res) => setAiAnalysis(res.data))
        .catch(() => setAiAnalysis(null))
        .finally(() => setAiLoading(false));
    } else {
      setAiAnalysis(null);
    }
  }, [isOpen, loanId, mode]);

  if (!isOpen) return null;

  const calculateAge = (dobVal?: string | Date | null): string => {
    if (!dobVal) return 'N/A';
    const birthDate = new Date(dobVal);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 'N/A' : `${age} yrs`;
  };

  // Calculate default total repayment if not pre-calculated
  const calculatedInterest = tenureDays
    ? Math.round(((requestedAmount * 12 * tenureDays) / (365 * 100)) * 100) / 100
    : Math.round(((requestedAmount * 12 * 180) / (365 * 100)) * 100) / 100;
  
  const finalRepaymentAmount = totalRepayment || requestedAmount + calculatedInterest;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (decision === 'REJECT' && !notes.trim()) {
      setError('Please provide a reason/remarks for rejection.');
      return;
    }

    if (mode === 'DISBURSEMENT' && decision === 'APPROVE' && !utr.trim()) {
      setError('UTR Number is required to complete disbursement.');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(decision, notes, mode === 'DISBURSEMENT' ? { utr } : undefined);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'SANCTION' ? 'Sanction Underwriting Decision' : 'Disbursement Release'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Loan ID: <strong className="font-mono text-slate-700">{loanId}</strong>
            </p>
          </div>
        </div>

        {/* Applicant Comprehensive Data Summary Card with Principal & Total Repayment Breakdown */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Applicant Comprehensive Profile
            </span>
            <span className="text-[11px] font-semibold text-slate-400 font-mono">12% p.a. Fixed SI</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Borrower Name:</span>
              <strong className="text-slate-800 font-bold text-sm">{borrowerName}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">PAN Card:</span>
              <strong className="font-mono text-slate-800 font-bold">{pan || 'N/A'}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">DOB / Age:</span>
              <strong className="text-slate-800 font-semibold">{calculateAge(dob)}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Monthly Income:</span>
              <strong className="text-slate-900 font-bold">₹{(monthlySalary || 0).toLocaleString('en-IN')}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Requested Principal:</span>
              <strong className="text-blue-600 font-extrabold text-sm">₹{requestedAmount.toLocaleString('en-IN')}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Total Repayment (P + 12% Interest):</span>
              <strong className="text-emerald-700 font-black text-sm">
                ₹{finalRepaymentAmount.toLocaleString('en-IN')}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Loan Tenure:</span>
              <strong className="text-slate-800 font-bold">{tenureDays || 180} Days</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">BRE Risk Status:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                (breStatus || 'PASSED') === 'PASSED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                {breStatus || 'PASSED'}
              </span>
            </div>
          </div>

          {/* Salary Slip Document Link inside Card */}
          {salarySlipUrl && (
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Salary Slip Proof:
              </span>
              <a
                href={salarySlipUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5" /> View Document <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          )}
        </div>

        {/* Render AI Credit Risk Assessment Card ONLY if genuine AI-generated record is available */}
        {mode === 'SANCTION' && aiAnalysis && aiAnalysis.isAiGenerated && (
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 rounded-xl text-white shadow-md border border-cyan-500/30 space-y-2 relative overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold tracking-wide uppercase text-cyan-200">
                  AI Credit Risk Assessment
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/20">
                ✨ Gemini AI
              </span>
            </div>

            {aiLoading ? (
              <div className="py-4 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Analyzing credit risk...
              </div>
            ) : (
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Risk Profile:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      aiAnalysis.riskLevel === 'LOW_RISK'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : aiAnalysis.riskLevel === 'MODERATE_RISK'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {aiAnalysis.riskLevel.replace('_', ' ')} ({aiAnalysis.riskScore}/100)
                  </span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed italic bg-white/5 p-2 rounded-lg border border-white/10">
                  "{aiAnalysis.summary}"
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Decision Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVE')}
                className={`py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 border-2 transition-all ${
                  decision === 'APPROVE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {mode === 'SANCTION' ? 'Approve Loan' : 'Release Funds'}
              </button>
              <button
                type="button"
                onClick={() => setDecision('REJECT')}
                className={`py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 border-2 transition-all ${
                  decision === 'REJECT'
                    ? 'border-rose-600 bg-rose-50 text-rose-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <XCircle className="w-5 h-5" />
                Reject Application
              </button>
            </div>
          </div>

          {mode === 'DISBURSEMENT' && decision === 'APPROVE' && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Bank Transfer UTR Number *</label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. UTR98410294812"
                className="mt-1 w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Officer Audit Remarks {decision === 'REJECT' && '*'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                decision === 'APPROVE'
                  ? 'Optional approval comments or BRE override justification...'
                  : 'Specify reason for rejection...'
              }
              className="mt-1 w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-colors disabled:opacity-50 ${
                decision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading ? 'Processing...' : 'Confirm Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
