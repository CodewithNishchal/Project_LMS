import React, { useState, useEffect, PropsWithChildren } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Loader2, FileText, ExternalLink, User, ShieldCheck, Check, Info } from 'lucide-react';
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
  organizationName?: string | null;
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
  organizationName,
  mode,
  onClose,
  onConfirm,
}) => {
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Gemini 2.5 Flash AI Inference & Loading States
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showLoadingPanel, setShowLoadingPanel] = useState(false);

  useEffect(() => {
    if (isOpen && (mode === 'SANCTION' || mode === 'DISBURSEMENT') && loanId) {
      setAiLoading(true);
      setShowLoadingPanel(false);

      // Delayed loading panel reveal (350ms) to prevent UI flickering on instant API errors
      const timer = setTimeout(() => {
        setShowLoadingPanel(true);
      }, 350);

      api.post('/sanction/ai-analyze', {
        loanId,
        fullName: borrowerName,
        monthlySalary,
        principalAmount: requestedAmount,
        tenureDays,
        breStatus,
        organizationName,
        salarySlipUrl,
      })
        .then((res) => {
          clearTimeout(timer);
          if (res.data && res.data.hasAiInference) {
            setAiAnalysis(res.data);
          } else {
            setAiAnalysis(null);
            setShowLoadingPanel(false);
          }
        })
        .catch(() => {
          clearTimeout(timer);
          setAiAnalysis(null);
          setShowLoadingPanel(false);
        })
        .finally(() => setAiLoading(false));
    } else {
      setAiAnalysis(null);
      setAiLoading(false);
      setShowLoadingPanel(false);
    }
  }, [isOpen, loanId, mode, borrowerName, monthlySalary, requestedAmount, tenureDays, breStatus, organizationName, salarySlipUrl]);

  if (!isOpen) return null;

  const isPanelLoading = aiLoading && showLoadingPanel;
  const isPanelReady = aiAnalysis && aiAnalysis.hasAiInference;
  const showAiPanel = isPanelLoading || isPanelReady;

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

    if (mode === 'DISBURSEMENT' && decision === 'APPROVE') {
      let cleanUtr = utr.trim();
      if (cleanUtr.startsWith('#')) cleanUtr = cleanUtr.substring(1).trim();
      if (cleanUtr.toUpperCase().startsWith('UTR#')) cleanUtr = 'UTR' + cleanUtr.substring(4).trim();

      if (!cleanUtr) {
        setError('UTR Number is required to complete disbursement.');
        return;
      }
      const utrFormatRegex = /^(UTR|[A-Z]{3,4})?[0-9]{12}$/i;
      if (!utrFormatRegex.test(cleanUtr)) {
        setError('Invalid UTR format. Bank UTR must consist of strictly 12 numeric digits (e.g. UTR984102948120 or 984102948120).');
        return;
      }
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
      <div
        className={`bg-white rounded-2xl p-6 shadow-2xl space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          showAiPanel ? 'max-w-6xl w-full' : 'max-w-lg w-full'
        }`}
      >
        <div className={showAiPanel ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch' : 'space-y-5'}>
          {/* LEFT SECTION: CURRENT UNTOUCHED DECISION PANEL */}
          <div className={showAiPanel ? 'lg:col-span-6 space-y-5' : 'space-y-5'}>
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
                <span className="text-[10px] font-semibold text-slate-400 font-mono">KYC & Financial Data</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Full Name</span>
                  <strong className="text-slate-800 text-sm font-semibold">{borrowerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly Income</span>
                  <strong className="text-emerald-700 text-sm font-bold">
                    {monthlySalary ? `₹${monthlySalary.toLocaleString('en-IN')}` : 'Not Specified'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PAN Card</span>
                  <strong className="font-mono text-slate-800 uppercase font-semibold">{pan || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Age / DOB</span>
                  <strong className="text-slate-800 font-medium">
                    {calculateAge(dob)}{' '}
                    {dob && <span className="text-[10px] text-slate-400 font-mono">({new Date(dob).toLocaleDateString()})</span>}
                  </strong>
                </div>
              </div>

              {/* Financial Calculations Highlight Pill */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border">
                <div>
                  <span className="text-slate-500 text-[10px] font-medium block">Requested Principal</span>
                  <span className="font-extrabold text-blue-600 text-sm">
                    ₹{requestedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-medium block">Total Repayment (P + SI)</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{finalRepaymentAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500">System BRE Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    breStatus === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {breStatus || 'PASSED'}
                </span>
              </div>

              {salarySlipUrl && (
                <div className="pt-1">
                  <a
                    href={salarySlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Uploaded Salary Slip Document <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
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
                    placeholder="e.g. UTR984102948120"
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

          {/* RIGHT SECTION: GEMINI 2.5 FLASH INFERENCE AUDIT PANEL (LIGHT THEME) */}
          {showAiPanel && (
            <div className="lg:col-span-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/40 text-slate-900 p-6 rounded-2xl border border-slate-200/90 space-y-4 shadow-sm animate-fade-in h-full flex flex-col justify-between">
              {isPanelLoading ? (
                /* LOADING STATE WITH ROTATING BAR & GLOWING SKELETONS */
                <div className="h-full flex flex-col justify-between space-y-6 my-auto py-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-wide">Gemini 2.5 Flash Audit</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> Inspecting...
                    </span>
                  </div>

                  <div className="space-y-4 my-auto py-6">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 text-indigo-600 shadow-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-base">Performing AI Underwriting</h5>
                        <p className="text-xs text-slate-500 mt-1">
                          Auditing salary slip & credit risk via Gemini 2.5 Flash...
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-300">
                      <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 h-full rounded-full animate-pulse w-3/4" />
                    </div>

                    {/* Skeletons */}
                    <div className="space-y-2.5 pt-2">
                      <div className="h-10 bg-white rounded-xl border border-slate-200 animate-pulse" />
                      <div className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 font-mono">
                    Multi-modal document inspection & underwriting
                  </div>
                </div>
              ) : (
                /* FULL GEMINI 2.5 FLASH RESULTS (LIGHT THEME) */
                <>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-wide">Gemini 2.5 Flash Audit</h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                      AI Model Active {aiAnalysis.analyzedAt ? '(Stored Output)' : ''}
                    </span>
                  </div>

                  {/* Risk Level Badge */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-semibold">Risk Score</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                          aiAnalysis.riskLevel === 'LOW_RISK'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : aiAnalysis.riskLevel === 'MODERATE_RISK'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {aiAnalysis.riskLevel?.replace('_', ' ') || 'LOW RISK'} ({aiAnalysis.riskScore}/100)
                      </span>
                    </div>
                  </div>

                  {/* Document Slip Analysis Breakdown */}
                  {aiAnalysis.slipAnalysis && (
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Document Slip Verification
                      </span>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500">Doc Type</span>
                          <span className="font-bold text-slate-800">{aiAnalysis.slipAnalysis.documentType}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500">Verified Income</span>
                          <span className="font-black text-emerald-700">{aiAnalysis.slipAnalysis.verifiedIncome}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-500">Employer Match</span>
                          <span className="font-bold text-blue-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-blue-600" /> {aiAnalysis.slipAnalysis.employerMatch}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Underwriting Verdict Summary
                    </span>
                    <p className="text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80 font-medium text-xs shadow-2xs">
                      {aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Key Insights Bullet Points */}
                  {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Key AI Audit Insights
                      </span>
                      <ul className="space-y-2 pl-1">
                        {aiAnalysis.keyInsights.map((insight: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 font-medium leading-normal">
                            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
