import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';
import { FireflyOverlay } from '../../components/common/FireflyOverlay';
import {
  Mail,
  Lock,
  User,
  Building2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';

export const StaffRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.SALES);
  const [secretKey, setSecretKey] = useState('creditsea_staff_2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your staff username or email.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (phone && phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    return true;
  };

  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    // Automatic @creditsea.com domain appending & formatting
    let formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail.includes('@')) {
      formattedEmail = `${formattedEmail}@creditsea.com`;
    } else if (!formattedEmail.endsWith('@creditsea.com')) {
      const username = formattedEmail.split('@')[0];
      formattedEmail = `${username}@creditsea.com`;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register/staff', {
        name: name.trim(),
        email: formattedEmail,
        password,
        phone: phone.trim() || undefined,
        role,
        secretKey: secretKey || 'creditsea_staff_2026',
      });
      const { token, user } = res.data;

      login(token, user);

      const routeMap: Record<UserRole, string> = {
        [UserRole.BORROWER]: '/borrower/dashboard',
        [UserRole.SALES]: '/dashboard/sales',
        [UserRole.SANCTION]: '/dashboard/sanction',
        [UserRole.DISBURSEMENT]: '/dashboard/disbursement',
        [UserRole.COLLECTION]: '/dashboard/collection',
        [UserRole.ADMIN]: '/dashboard/admin',
      };

      navigate(routeMap[user.role as UserRole] || '/dashboard/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Staff registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans bg-white">
      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 h-full p-8 lg:p-14 flex flex-col justify-between overflow-y-auto bg-white relative animate-fade-in-up">
        <div className="flex items-center space-x-3 relative z-10">
          <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-600/20">
            <Building2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">
              CreditSea
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 tracking-widest uppercase mt-0.5 block">
              Staff Portal
            </span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-6 relative z-10 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Staff Onboarding
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Create an internal officer account with role-based permissions
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-between animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStaffRegister} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Staff Full Name"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-xs"
              />
            </div>

            {/* Email Input with Fixed End Suffix Badge */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username (e.g. dv_Sales)"
                className="w-full pl-11 pr-36 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-xs"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-emerald-300/80 shadow-2xs">
                  @creditsea.com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Phone (10 digits)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-xs"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-9 pr-2 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-emerald-600 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-xs"
                >
                  <option value={UserRole.SALES}>SALES</option>
                  <option value={UserRole.SANCTION}>SANCTION</option>
                  <option value={UserRole.DISBURSEMENT}>DISBURSEMENT</option>
                  <option value={UserRole.COLLECTION}>COLLECTION</option>
                  <option value={UserRole.ADMIN}>ADMIN</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Staff Password (min 6 chars)"
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Secret Authorization Key"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-emerald-600 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Registering Staff...' : 'Create Staff Account'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Staff Login
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-100 relative z-10">
          <span>CreditSea LMS Enterprise</span>
          <span>Security Protocol Encrypted</span>
        </div>
      </div>

      {/* RIGHT SECTION: Shifted Up Header + Fingerprint + Corner Green Fireflies */}
      <div className="hidden lg:flex w-1/2 h-full bg-slate-900 relative flex-col justify-between p-8 lg:p-12 text-white overflow-hidden">
        {/* GREEN FIREFLIES (5-6 CORNER-SPREAD FLOWING JUGNU DOTS) */}
        <FireflyOverlay theme="green" count={6} />

        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500 blur-3xl" />
        </div>

        {/* Shifted UP Text Header Block */}
        <div className="relative z-10 space-y-2.5 max-w-lg pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Internal Officer Portal
          </div>

          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Role-Based Access Control & Operations Queue
          </h2>

          <p className="text-slate-400 text-xs lg:text-sm leading-relaxed">
            Staff onboarding registers internal officers across Sales Telecalling, Sanction Underwriting, Disbursement Payout, and Collection Recovery desks with domain-verified credentials.
          </p>
        </div>

        {/* Center: Extra Large Glowing Green Biometric Fingerprint Graphic */}
        <div className="relative z-10 flex items-center justify-center my-auto w-full py-1">
          <img
            src="/fingureprint.png"
            alt="Biometric Security Fingerprint"
            className="w-[580px] lg:w-[680px] max-h-[480px] object-contain drop-shadow-[0_0_70px_rgba(16,185,129,0.9)] animate-pulse transition-all duration-300 transform scale-110"
          />
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex justify-between items-center border-t border-slate-800/80 pt-3">
          <span>© 2026 CreditSea LMS. Staff Security Portal.</span>
          <span className="text-emerald-400 font-mono text-[11px] font-bold">256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
