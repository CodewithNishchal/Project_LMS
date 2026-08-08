import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Calculator, ShieldCheck } from 'lucide-react';

interface Props {
  onApply: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step4Calculator: React.FC<Props> = ({ onApply, onBack, initialData }) => {
  const [principal, setPrincipal] = useState<number>(initialData?.principalAmount || 100000); // Default ₹1,00,000
  const [tenure, setTenure] = useState<number>(initialData?.tenureDays || 180);           // Default 180 days
  const interestRate = 12;                                     // 12% p.a.

  // Real-time Frontend Display Math
  const simpleInterest = Math.round(((principal * interestRate * tenure) / (365 * 100)) * 100) / 100;
  const totalRepayment = principal + simpleInterest;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-10 bg-white rounded-3xl shadow-sm border border-slate-100 animate-fade-in-up min-h-[440px]">
      {/* Left Column: Sliders */}
      <div className="flex flex-col justify-between space-y-6">
        <div>
          <div className="border-b pb-4 mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" /> Configure Loan Terms
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Adjust sliders to choose your principal & tenure</p>
          </div>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loan Amount</label>
                <span className="text-blue-600 font-black text-base bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                  ₹{principal.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={500000}
                step={5000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                <span>₹50,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tenure Duration</label>
                <span className="text-blue-600 font-black text-base bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                  {tenure} Days
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={365}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                <span>30 Days</span>
                <span>365 Days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-700 font-semibold flex items-center gap-2 mt-4">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Transparent 12% p.a. fixed simple interest rate. Zero hidden fees.</span>
        </div>
      </div>

      {/* Right Column: Live KFS Offer Preview */}
      <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-6 shadow-xs">
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-3 tracking-wider uppercase flex items-center justify-between">
            <span>Key Fact Statement (KFS) Preview</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Instant Approval
            </span>
          </h4>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-semibold">Principal Amount:</span>
              <span className="font-extrabold text-slate-900 text-base">₹{principal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-semibold">Fixed Interest Rate:</span>
              <span className="font-extrabold text-emerald-600">12% p.a.</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-semibold">Calculated Simple Interest:</span>
              <span className="font-extrabold text-amber-600">₹{simpleInterest.toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t border-slate-200 pt-4 flex justify-between font-black text-lg text-slate-900">
              <span>Total Repayment:</span>
              <span className="text-blue-600">₹{totalRepayment.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={() => onApply({ principalAmount: principal, tenureDays: tenure })}
            className="w-2/3 py-3.5 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-blue-600/35 flex items-center justify-center gap-2 text-sm"
          >
            Submit Application <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
