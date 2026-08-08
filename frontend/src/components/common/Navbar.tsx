import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, LogOut, UserCheck, LayoutDashboard, PhoneCall, ShieldCheck, Landmark, IndianRupee } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminNavItems = [
    { label: 'Overview', path: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Sales Queue', path: '/dashboard/sales', icon: PhoneCall },
    { label: 'Sanction', path: '/dashboard/sanction', icon: ShieldCheck },
    { label: 'Disbursement', path: '/dashboard/disbursement', icon: Landmark },
    { label: 'Collection', path: '/dashboard/collection', icon: IndianRupee },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand: Clicking takes user to /dashboard */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-600/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">CreditSea</span>
                <span className="text-xs text-blue-400 font-semibold block leading-tight">LMS Enterprise</span>
              </div>
            </Link>
          </div>

          {/* Admin Full Dashboard Queue Navigation */}
          {user?.role === UserRole.ADMIN && (
            <nav className="hidden md:flex items-center space-x-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-700/80 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right User Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-200">{user.name}</p>
                  <p className="text-[10px] text-blue-400 font-mono font-semibold uppercase">{user.role}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xs shadow-inner">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
