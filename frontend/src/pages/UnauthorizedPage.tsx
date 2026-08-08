import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-4 bg-rose-100 text-rose-600 rounded-full mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">403 - Access Denied</h1>
      <p className="text-slate-500 mt-2 max-w-md">
        You do not have the operational role permissions required to access this dashboard queue.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-md"
      >
        <ArrowLeft className="w-4 h-4" /> Switch Role or Sign In
      </Link>
    </div>
  );
};
