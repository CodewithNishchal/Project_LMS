import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FireflyOverlay } from '../../components/common/FireflyOverlay';
import { Shield, UserPlus, AlertTriangle, Lock, Mail, User, Phone, Zap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g., rahul@example.com).');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (phone && !phoneRegex.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number starting with 6-9.');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
      });
      const { token, user } = res.data;

      login(token, user);
      navigate('/borrower/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans bg-white">
      {/* LEFT SECTION (50% Width Full Screen) */}
      <div className="w-full lg:w-1/2 h-full p-8 lg:p-14 flex flex-col justify-between overflow-y-auto bg-white relative animate-fade-in-up">
        <div className="flex items-center space-x-3 relative z-10">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-600/20">
            <Shield className="w-6 h-6 fill-current text-blue-600 stroke-white stroke-[2]" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">CreditSea</span>
            <span className="text-[11px] text-blue-600 font-semibold px-2.5 py-0.5 bg-blue-50 rounded-full border border-blue-100">
              Borrower
            </span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-4 space-y-5 relative z-10">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Create Your Account
            </h1>
            <p className="text-sm font-medium text-slate-400">
              Apply for instant personal loans with 5-minute approval
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in-up">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-xs"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-xs"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210 (10 digits)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-xs"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••• (min 6 characters)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up as Borrower'}
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-3 pt-2 text-center text-xs">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-slate-500 text-[11px] font-medium">
              Internal Staff Member?{' '}
              <Link to="/register/staff" className="font-bold text-emerald-600 hover:underline ml-1">
                Staff Onboarding Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium text-center relative z-10 pt-4 border-t border-slate-100">
          © 2026 CreditSea LMS Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SECTION: Deep Blue Ocean Theme + 6 Blue Corner Fireflies (Jugnu Effect) */}
      <div className="hidden lg:flex w-1/2 h-full bg-[#080e21] relative flex-col justify-between p-8 lg:p-12 text-white overflow-hidden shadow-2xl">
        {/* BLUE FIREFLIES (5-6 CORNER-SPREAD FLOWING JUGNU DOTS) */}
        <FireflyOverlay theme="blue" count={6} />

        {/* Ambient Glows */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-600 blur-3xl" />
        </div>

        {/* Shifted UP Text Header Block */}
        <div className="relative z-10 space-y-2.5 max-w-lg pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-bounce" />
            <span>Instant Borrower Registration</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Role-Based Access Control & Operations Queue
          </h2>

          <p className="text-slate-400 text-xs lg:text-sm leading-relaxed">
            Role-Based Access Control across Sales Telecalling, Sanction Underwriting, Disbursement Payout, and Collection Recovery desks with domain-verified credentials.
          </p>
        </div>

        {/* Center: Extra Large Glowing Cyan/Blue Biometric Fingerprint Graphic */}
        <div className="relative z-10 flex items-center justify-center my-auto w-full py-1">
          <img
            src="/fingureprint.png"
            alt="Biometric Security Fingerprint"
            className="w-[580px] lg:w-[680px] max-h-[480px] object-contain drop-shadow-[0_0_70px_rgba(0,210,255,0.9)] animate-pulse transition-all duration-300 transform scale-110"
          />
        </div>

        {/* Bottom Footer Row */}
        <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center border-t border-slate-800/80 pt-3">
          <span>© 2026 CreditSea LMS. Borrower Portal.</span>
          <span className="text-cyan-400 font-mono text-[11px] font-bold">256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
