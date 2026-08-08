import React, { useState } from 'react';
import { CreditCard, Calendar, IndianRupee, Briefcase, Building, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';

interface Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export const Step2BreForm: React.FC<Props> = ({ onNext, onBack, initialData }) => {
  // Parse initial DOB if available
  const initialDobParts = initialData?.dob ? initialData.dob.split('-') : ['', '', ''];

  const [pan, setPan] = useState(initialData?.pan || '');
  const [day, setDay] = useState(initialDobParts[2] || '');
  const [month, setMonth] = useState(initialDobParts[1] || '');
  const [year, setYear] = useState(initialDobParts[0] || '');
  const [income, setIncome] = useState<number | ''>(initialData?.monthlyIncome || '');
  const [empType, setEmpType] = useState<'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED'>(
    initialData?.employmentType || 'SALARIED'
  );
  const [orgName, setOrgName] = useState(initialData?.organizationName || '');
  const [error, setError] = useState('');

  // Generate Year options for 23 to 50 age range (e.g. 1976 to 2003)
  const currentYear = 2026;
  const minYear = currentYear - 50; // 1976
  const maxYear = currentYear - 23; // 2003
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i); // [2003, 2002, ..., 1976]

  const months = [
    { num: '01', name: 'Jan (01)' },
    { num: '02', name: 'Feb (02)' },
    { num: '03', name: 'Mar (03)' },
    { num: '04', name: 'Apr (04)' },
    { num: '05', name: 'May (05)' },
    { num: '06', name: 'Jun (06)' },
    { num: '07', name: 'Jul (07)' },
    { num: '08', name: 'Aug (08)' },
    { num: '09', name: 'Sep (09)' },
    { num: '10', name: 'Oct (10)' },
    { num: '11', name: 'Nov (11)' },
    { num: '12', name: 'Dec (12)' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    return d < 10 ? `0${d}` : `${d}`;
  });

  const calculateAge = (dobString: string): number => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validate = (): boolean => {
    setError('');

    // PAN Validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan || !panRegex.test(pan.toUpperCase())) {
      setError('Please enter a valid 10-character Indian PAN Card number (e.g. ABCDE1234F).');
      return false;
    }

    // DOB Validation
    if (!day || !month || !year) {
      setError('Please select Day, Month, and Year for Date of Birth.');
      return false;
    }

    const constructedDob = `${year}-${month}-${day}`;
    const age = calculateAge(constructedDob);

    if (isNaN(age) || age < 23 || age > 50) {
      setError(`Applicant age must be between 23 and 50 years old to be eligible for loan approval. (Calculated age: ${isNaN(age) ? 'Invalid' : age} years).`);
      return false;
    }

    // Employment Mode Validation (Unemployed Check)
    if (empType === 'UNEMPLOYED') {
      setError('Unemployed applicants are ineligible for personal loan approval. Active employment is required.');
      return false;
    }

    // Strict Salary Validation (Minimum ₹25,000)
    if (!income || Number(income) < 25000) {
      setError('Monthly income must be strictly ₹25,000 or higher to be eligible for loan sanction.');
      return false;
    }

    // Company Name Validation
    if (!orgName.trim()) {
      setError('Company / Organization name is required.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const constructedDob = `${year}-${month}-${day}`;
    onNext({
      pan: pan.toUpperCase(),
      dob: constructedDob,
      monthlyIncome: Number(income),
      employmentType: empType,
      organizationName: orgName.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto animate-fade-in-up">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-slate-800">Financial & BRE Details</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">Used for instant automated credit underwriting assessment</p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-2 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* PAN Card Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PAN Card Number</label>
        <div className="relative">
          <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            required
            maxLength={10}
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-sm font-mono tracking-wider uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Fast 3-Part Date of Birth Dropdown Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          Date of Birth <span className="text-blue-600 font-semibold text-[11px] lowercase">(eligible: 23–50 yrs)</span>
        </label>
        
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
            >
              <option value="">Day (DD)</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
            >
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-xs font-bold text-blue-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
            >
              <option value="">Year (YYYY)</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Income & Employment */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Monthly Income (Min ₹25,000)
          </label>
          <div className="relative">
            <IndianRupee className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              required
              min={25000}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              placeholder="e.g. 75000"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Employment Type</label>
          <div className="relative">
            <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
            <select
              value={empType}
              onChange={(e) => setEmpType(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
            >
              <option value="SALARIED">Salaried</option>
              <option value="SELF_EMPLOYED">Self Employed</option>
              <option value="UNEMPLOYED">Unemployed (Ineligible)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name</label>
        <div className="relative">
          <Building className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. CreditSea Corp"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          className="w-2/3 py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm"
        >
          Save & Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
