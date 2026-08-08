import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';
import { FireflyOverlay } from '../../components/common/FireflyOverlay';
import {
  Mail,
  Lock,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
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
      setError(err.response?.data?.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans bg-white">
      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 h-full p-8 lg:p-14 flex flex-col justify-between overflow-y-auto bg-white relative animate-fade-in-up">
        
        {/* Brand Logo Header */}
        <div className="flex items-center space-x-3 relative z-10">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-600/20">
            <Building2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">
              CreditSea
            </span>
            <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase mt-0.5 block">
              LMS Portal
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-6 relative z-10 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs font-semibold text-slate-400">
              Sign in to access your dashboard & loan queue
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-between animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-xs"
              />
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
                placeholder="Password"
                className="w-full pl-11 pr-10 py-3 bg-slate-50/60 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-medium pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 accent-blue-600"
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-blue-600 font-bold hover:underline transition-colors">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-300 uppercase">or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="text-center text-xs">
            <p className="text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium text-center relative z-10 flex items-center justify-center gap-1.5 pt-4 border-t border-slate-100">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
          <span>© 2026 CreditSea LMS Inc. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT SECTION: Deep Blue Ocean Theme + Corner Blue Fireflies */}
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
            <span>Internal Officer & Borrower Portal</span>
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
          <span>© 2026 CreditSea LMS. Staff Security Portal.</span>
          <span className="text-cyan-400 font-mono text-[11px] font-bold">256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
