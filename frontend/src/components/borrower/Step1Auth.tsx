import React, { useState } from 'react';
import { User, Mail, Phone, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
  onNext: (data: { name: string; email: string; phone: string }) => void;
  initialData?: { name?: string; email?: string; phone?: string };
}

export const Step1Auth: React.FC<Props> = ({ onNext, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validate = (): boolean => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setGeneralError('');

    // Name Validation
    if (!name.trim()) {
      setNameError('Full name is required as per PAN card.');
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError('Full name must be at least 3 characters long.');
      isValid = false;
    }

    // Email Validation (Strict Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address (e.g. nishchal@example.com).');
      isValid = false;
    }

    // Mobile Number Validation (Strict 10-digit Indian Mobile Regex)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.trim()) {
      setPhoneError('10-digit mobile number is required.');
      isValid = false;
    } else if (!phoneRegex.test(phone.trim())) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onNext({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto animate-fade-in-up">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-slate-800">Borrower Registration & Contact Info</h3>
        <p className="text-sm text-slate-500 mt-1">Start your loan application process with CreditSea</p>
      </div>

      {generalError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {generalError}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name (As per PAN)</label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Nishchal Verma"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border rounded-xl focus:bg-white text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
              nameError ? 'border-rose-400 focus:ring-rose-400/30' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/30'
            }`}
          />
        </div>
        {nameError && <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{nameError}</p>}
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            placeholder="e.g. nishchal@example.com"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border rounded-xl focus:bg-white text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
              emailError ? 'border-rose-400 focus:ring-rose-400/30' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/30'
            }`}
          />
        </div>
        {emailError && <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{emailError}</p>}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number (10 Digits)</label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(cleaned);
              if (phoneError) setPhoneError('');
            }}
            placeholder="e.g. 9876543210"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border rounded-xl focus:bg-white text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
              phoneError ? 'border-rose-400 focus:ring-rose-400/30' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/30'
            }`}
          />
        </div>
        {phoneError && <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{phoneError}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-4 text-sm"
      >
        Proceed to Financial Details <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};
