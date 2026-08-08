import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useSalesLeads, useToggleEngageLead, useConvertLead } from '../../hooks/useDashboardPolling';
import {
  PhoneCall,
  Handshake,
  UserCheck,
  Search,
  RefreshCcw,
  Loader2,
  FileText,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

export const SalesDashboard: React.FC = () => {
  const [tab, setTab] = useState<'UNAPPLIED' | 'ENGAGED'>('UNAPPLIED');
  const [search, setSearch] = useState('');
  const [conversionToast, setConversionToast] = useState<{ leadName: string; loanId: string } | null>(null);

  const { data: leadData = { all: [], unapplied: [], engaged: [] }, isLoading } = useSalesLeads();
  const toggleEngageMutation = useToggleEngageLead();
  const convertLeadMutation = useConvertLead();

  const handleConvertLead = async (leadId: string, leadName: string) => {
    try {
      const res = await convertLeadMutation.mutateAsync(leadId);
      setConversionToast({
        leadName,
        loanId: res.loan?._id || leadId,
      });
      setTimeout(() => setConversionToast(null), 10000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to convert lead.');
    }
  };

  const currentList = tab === 'UNAPPLIED' ? leadData.unapplied : leadData.engaged;

  const filteredLeads = currentList.filter(
    (l: any) =>
      l.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Navbar />

      {/* SALES CONVERSION NOTIFICATION TOAST */}
      {conversionToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm animate-fade-in-up flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Lead Converted!
            </div>
            <p className="text-xs text-slate-300">
              <strong>{conversionToast.leadName}</strong> has been converted into an active application and routed to Sanction Underwriting!
            </p>
            <p className="text-[10px] font-mono text-slate-400 pt-1">
              Loan ID: {conversionToast.loanId}
            </p>
          </div>
          <button
            onClick={() => setConversionToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Executive Dashboard</h1>
            <p className="text-sm text-slate-500">Unapplied Customer Leads & Active Engagement Queue</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border">
            <RefreshCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" /> Live 5s Polling
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setTab('UNAPPLIED')}
            className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'UNAPPLIED'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Search className="w-4 h-4" /> New Unapplied Leads ({leadData.unapplied.length})
          </button>
          <button
            onClick={() => setTab('ENGAGED')}
            className={`py-3 px-5 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              tab === 'ENGAGED'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Handshake className="w-4 h-4" /> Engaged Leads ({leadData.engaged.length})
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead by name, phone or email..."
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredLeads.length} of {currentList.length} Leads
          </span>
        </div>

        {/* Leads Table with Horizontal Overflow Auto Scroll */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Loading sales leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              {tab === 'UNAPPLIED'
                ? 'No new unapplied sales leads in queue.'
                : 'No engaged leads in this tab yet. Click "Lead Engaged" on any unapplied lead to move it here!'}
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600">
                  <th className="p-4 pl-6 font-semibold whitespace-nowrap">Lead ID</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Customer Details</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Monthly Salary</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Salary Slip Proof</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Created Date</th>
                  <th className="p-4 pr-6 font-semibold text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {filteredLeads.map((lead: any) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900 text-xs font-mono whitespace-nowrap">{lead._id}</td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{lead.fullName}</p>
                      <p className="text-xs text-slate-400">{lead.phone} | {lead.email}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap font-semibold text-slate-800">
                      {lead.status !== 'LEAD' && lead.status !== 'LEAD_ENGAGED' && lead.monthlySalary ? (
                        `₹${lead.monthlySalary.toLocaleString('en-IN')}`
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Pending Application</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {lead.salarySlipUrl ? (
                        <a
                          href={lead.salarySlipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200/80 transition-colors whitespace-nowrap shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> View Document <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No Slip</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap space-x-2">
                      {/* TAB 1 ACTION: Lead Engaged */}
                      {tab === 'UNAPPLIED' && (
                        <button
                          onClick={() => toggleEngageMutation.mutate({ leadId: lead._id, action: 'ENGAGE' })}
                          disabled={toggleEngageMutation.isPending}
                          className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors border border-purple-200"
                        >
                          <Handshake className="w-3.5 h-3.5 text-purple-600" /> Lead Engaged
                        </button>
                      )}

                      {/* TAB 2 ACTIONS: Bring Back or Convert */}
                      {tab === 'ENGAGED' && (
                        <>
                          <button
                            onClick={() => toggleEngageMutation.mutate({ leadId: lead._id, action: 'BRING_BACK' })}
                            disabled={toggleEngageMutation.isPending}
                            className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
                          >
                            Unmark Engaged
                          </button>
                          <button
                            onClick={() => handleConvertLead(lead._id, lead.fullName)}
                            disabled={convertLeadMutation.isPending}
                            className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Convert to Application
                          </button>
                        </>
                      )}

                      <a
                        href={`tel:${lead.phone}`}
                        className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors border border-blue-200"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Call Lead
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};
