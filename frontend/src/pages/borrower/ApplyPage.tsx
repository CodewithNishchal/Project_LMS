import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Step1Auth } from '../../components/borrower/Step1Auth';
import { Step2BreForm } from '../../components/borrower/Step2BreForm';
import { Step3SlipUpload } from '../../components/borrower/Step3SlipUpload';
import { Step4Calculator } from '../../components/borrower/Step4Calculator';
import { KfsPreview } from '../../components/borrower/KfsPreview';
import { CheckCircle2, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export const ApplyPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const steps = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'BRE & Salary' },
    { num: 3, title: 'Document Upload' },
    { num: 4, title: 'Configure & Submit' },
  ];

  const handleStep1 = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2 = (data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      profile: { ...prev.profile, ...data },
    }));
    setStep(3);
  };

  const handleStep3 = (fileUrl: string) => {
    setFormData((prev: any) => ({
      ...prev,
      profile: { ...prev.profile, salarySlipUrl: fileUrl },
    }));
    setStep(4);
  };

  const handleFinalSubmit = async (loanTerms: any) => {
    setSubmitting(true);
    setError('');

    try {
      const applicantName = formData.fullName || formData.name;

      const finalPayload = {
        fullName: applicantName,
        email: formData.email,
        phone: formData.phone || formData.mobileNumber,
        pan: formData.profile?.pan,
        dob: formData.profile?.dob,
        monthlySalary: formData.profile?.monthlyIncome,
        employmentMode: formData.profile?.employmentType,
        organizationName: formData.profile?.organizationName,
        salarySlipUrl: formData.profile?.salarySlipUrl,
        principalAmount: loanTerms.principalAmount,
        tenureDays: loanTerms.tenureDays,
      };

      const res = await api.post('/borrower/apply', finalPayload);
      setFormData((prev: any) => ({
        ...prev,
        ...res.data.loan,
        fullName: applicantName,
        borrowerName: applicantName,
      }));
      setSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Unauthorized role or session expired (HTTP 403). Redirecting to Login page...');
        setTimeout(() => {
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_user');
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(err.response?.data?.message || 'Failed to submit loan application to server.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-4 pt-8">
        {!submitted ? (
          <>
            {/* Multi-step progress bar */}
            <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center">
                {steps.map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          step >= s.num
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                      </div>
                      <span
                        className={`text-xs font-semibold hidden sm:inline ${
                          step >= s.num ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded ${
                          step > s.num ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center gap-2 animate-fade-in-up">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {submitting && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold rounded-2xl flex items-center gap-3 animate-fade-in-up">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <span>Submitting loan application to server...</span>
              </div>
            )}

            {/* Active Wizard Step Component with State Pre-filling & Back Navigation */}
            {step === 1 && <Step1Auth onNext={handleStep1} initialData={formData} />}
            {step === 2 && <Step2BreForm onNext={handleStep2} onBack={() => setStep(1)} initialData={formData.profile} />}
            {step === 3 && <Step3SlipUpload onNext={handleStep3} onBack={() => setStep(2)} initialData={formData.profile} />}
            {step === 4 && <Step4Calculator onApply={handleFinalSubmit} onBack={() => setStep(3)} initialData={formData} />}
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-2xl font-bold text-emerald-900">Application Submitted Successfully!</h2>
              <p className="text-sm text-emerald-700 max-w-md mx-auto">
                Your loan request has been routed to the Sanction Underwriting queue. You can track status live on your borrower dashboard.
              </p>
              <button
                onClick={() => navigate('/borrower/dashboard')}
                className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                Go to Borrower Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <KfsPreview loan={{ ...formData, fullName: formData.fullName || formData.name }} />
          </div>
        )}
      </div>
    </div>
  );
};
