import React from 'react';
import { ILoan } from '../../types';
import { ShieldCheck, Printer } from 'lucide-react';

interface Props {
  loan: Partial<ILoan> & Record<string, any>;
}

export const KfsPreview: React.FC<Props> = ({ loan }) => {
  const borrowerName = loan.fullName || loan.borrowerName || loan.name || 'Nishchal Verma';
  const principal = loan.principalAmount || 0;
  const tenure = loan.tenureDays || 365;
  const rate = loan.interestRate || 12;

  // Calculate exact simple interest: (P * R * T) / (365 * 100)
  const calculatedInterest = loan.calculatedInterest 
    || Math.round(((principal * rate * tenure) / (365 * 100)) * 100) / 100;

  const totalPayable = loan.totalRepayment || (principal + calculatedInterest);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6 max-w-2xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-black text-slate-900">Key Fact Statement (KFS)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">RBI Compliant Standardized Loan Summary Document</p>
        </div>
        <button
          onClick={() => window.print()}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          title="Print KFS Document"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">
        <div>
          <span className="text-xs text-slate-500 uppercase block font-semibold">Borrower Name</span>
          <span className="font-bold text-slate-800">{borrowerName}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase block font-semibold">Sanction / Request Date</span>
          <span className="font-bold text-slate-800">
            {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b bg-slate-100 text-slate-700">
            <th className="p-3 font-semibold">Parameter</th>
            <th className="p-3 font-semibold text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y text-slate-600">
          <tr>
            <td className="p-3 font-medium text-slate-800">Sanctioned Principal Amount</td>
            <td className="p-3 text-right font-bold text-slate-900">₹{principal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-800">Rate of Interest (Simple)</td>
            <td className="p-3 text-right font-semibold text-blue-600">{rate}% p.a.</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-800">Tenure Duration</td>
            <td className="p-3 text-right font-semibold">{tenure} Days</td>
          </tr>
          <tr>
            <td className="p-3 font-medium text-slate-800">Total Interest Payable</td>
            <td className="p-3 text-right font-extrabold text-amber-600">
              ₹{calculatedInterest.toLocaleString('en-IN')}
            </td>
          </tr>
          <tr className="bg-blue-50/50">
            <td className="p-3 font-bold text-blue-900">Total Amount Payable</td>
            <td className="p-3 text-right font-black text-blue-700 text-base">
              ₹{totalPayable.toLocaleString('en-IN')}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="text-xs text-slate-400 border-t pt-4 space-y-1">
        <p>* No hidden processing fees or foreclosure penalty charges apply.</p>
        <p>* Early repayment option available without additional interest penalty.</p>
      </div>
    </div>
  );
};
