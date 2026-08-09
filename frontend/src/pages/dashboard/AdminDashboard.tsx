import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Landmark,
  ShieldCheck,
  Calendar,
  Info,
  ChevronRight,
  Loader2,
  PhoneCall,
  FileText,
  Eye,
  ExternalLink,
  X,
  Activity,
  FileDown,
  TrendingUp,
  Coins,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'This Month' | 'This Quarter' | 'This Year'>('This Month');
  const [allLoansModalOpen, setAllLoansModalOpen] = useState(false);
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState(false);
  const [loanSearch, setLoanSearch] = useState('');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const { data: allLoans = [], isLoading: loadingAllLoans } = useQuery({
    queryKey: ['adminAllLoans'],
    queryFn: async () => {
      const res = await api.get('/admin/all-loans');
      return res.data;
    },
    enabled: allLoansModalOpen,
  });

  const { data: allAuditLogs = [], isLoading: loadingAuditLogs } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    },
    enabled: auditLogsModalOpen,
  });

  const totalPortfolio = metrics?.totalPortfolioValue || 0;
  const activeDisbursed = metrics?.activeDisbursed || 0;
  const closedLoans = metrics?.closedLoans || 0;
  const appliedLoans = metrics?.appliedLoans || 0;
  const rejectedLoans = metrics?.rejectedLoans || 0;
  const repaidTotal = metrics?.repaidTotal || 0;
  const totalProfitGains = metrics?.totalProfitGains || 0;
  const totalLoans = metrics?.totalLoans || 0;
  const monthlyTrends = metrics?.monthlyTrends || [
    { label: 'Mar', amount: 0 },
    { label: 'Apr', amount: 0 },
    { label: 'May', amount: 0 },
    { label: 'Jun', amount: 0 },
    { label: 'Jul', amount: 0 },
    { label: 'Aug', amount: totalPortfolio || 100000 },
  ];

  const calcPct = (count: number) => (totalLoans > 0 ? Math.round((count / totalLoans) * 100) : 0);

  const filteredAllLoans = allLoans.filter(
    (l: any) =>
      l.fullName?.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.email?.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.pan?.toLowerCase().includes(loanSearch.toLowerCase()) ||
      l.status?.toLowerCase().includes(loanSearch.toLowerCase())
  );

  // Compute dynamic SVG curve points from past 6 months data (Mar - Aug)
  const maxTrendAmount = Math.max(...monthlyTrends.map((t: any) => t.amount), 100000);
  const chartPoints = monthlyTrends.map((t: any, i: number) => {
    const x = Math.round((i / (monthlyTrends.length - 1)) * 360);
    const y = Math.round(100 - (t.amount / maxTrendAmount) * 85);
    return { x, y, label: t.label, amount: t.amount };
  });

  const svgPathD = `M ${chartPoints.map((p: any) => `${p.x},${p.y}`).join(' L ')}`;
  const svgAreaD = `${svgPathD} L 360,120 L 0,120 Z`;

  // Print & Save as PDF Report Handler
  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to view and save the PDF report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CreditSea_Executive_Portfolio_Report_${new Date().toISOString().split('T')[0]}.pdf</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .header { border-b: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 13px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
            .kpi-card span { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; }
            .kpi-card strong { font-size: 20px; color: #0f172a; display: block; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
            th { background: #f1f5f9; color: #334155; font-weight: 700; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 40px; border-t: 1px solid #e2e8f0; pt: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>CreditSea LMS Executive Portfolio Report</h1>
              <p>System-wide Portfolio Analytics, Risk & Recovery Performance Summary</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Status:</strong> Confidential Official Document
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <span>Total Disbursed Portfolio</span>
              <strong style="color: #2563eb;">₹${totalPortfolio.toLocaleString('en-IN')}</strong>
            </div>
            <div class="kpi-card">
              <span>Total Collections Repaid</span>
              <strong style="color: #059669;">₹${repaidTotal.toLocaleString('en-IN')}</strong>
            </div>
            <div class="kpi-card">
              <span>Total Net Profit Gains</span>
              <strong style="color: #16a34a;">+₹${totalProfitGains.toLocaleString('en-IN')}</strong>
            </div>
            <div class="kpi-card">
              <span>Closed / Repaid Loans</span>
              <strong style="color: #0f172a;">${closedLoans} Loans</strong>
            </div>
          </div>

          <h3 style="margin-top: 25px; color: #0f172a; font-size: 16px;">Past 6 Months Portfolio Disbursement Curve</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Disbursed Portfolio Amount (₹)</th>
                <th>Monthly Portfolio Status</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyTrends.map((t: any) => `
                <tr>
                  <td><strong>${t.label} 2026</strong></td>
                  <td>₹${t.amount.toLocaleString('en-IN')}</td>
                  <td>${t.amount > 0 ? 'Active Disbursal Portfolio' : 'No Disbursals Recorded (₹0)'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="margin-top: 25px; color: #0f172a; font-size: 16px;">Loan Application Stage Distribution</h3>
          <table>
            <thead>
              <tr>
                <th>Stage Category</th>
                <th>Loan Count</th>
                <th>Percentage Ratio</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Active Disbursed Loans</td><td>${activeDisbursed}</td><td>${calcPct(activeDisbursed)}%</td></tr>
              <tr><td>Closed / Repaid Loans</td><td>${closedLoans}</td><td>${calcPct(closedLoans)}%</td></tr>
              <tr><td>Applied / Unapplied Leads</td><td>${appliedLoans}</td><td>${calcPct(appliedLoans)}%</td></tr>
              <tr><td>Rejected Applications</td><td>${rejectedLoans}</td><td>${calcPct(rejectedLoans)}%</td></tr>
            </tbody>
          </table>

          <div class="footer">
            Generated automatically by CreditSea Enterprise LMS Admin Engine. Confidential & Proprietary.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col pb-16 font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full space-y-8 animate-fade-in-up">
        
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Admin Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              System Analytics & Operational Performance Overview
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Live 5s Polling</span>
            </div>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <FileDown className="w-4 h-4" /> Export Report (PDF)
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="text-sm font-bold">Loading Executive Analytics...</span>
          </div>
        ) : (
          <>
            {/* Top 4 KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Total Disbursed Portfolio */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">TOTAL DISBURSED PORTFOLIO</span>
                    <Info className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      ₹{totalPortfolio.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mt-1">Sum of Disbursed Capital</p>
                  </div>
                  <svg className="w-20 h-10 text-blue-500 fill-current opacity-80" viewBox="0 0 100 40">
                    <path d="M0 30 Q25 10 50 25 T100 10 L100 40 L0 40 Z" fill="rgba(59, 130, 246, 0.15)" />
                    <path d="M0 30 Q25 10 50 25 T100 10" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Stat 2: Total Collections Repaid */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">TOTAL COLLECTIONS REPAID</span>
                    <Info className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
                      ₹{repaidTotal.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Total Payments Received</p>
                  </div>
                  <svg className="w-20 h-10 text-emerald-500 fill-current opacity-80" viewBox="0 0 100 40">
                    <path d="M0 35 Q30 5 60 25 T100 5 L100 40 L0 40 Z" fill="rgba(16, 185, 129, 0.15)" />
                    <path d="M0 35 Q30 5 60 25 T100 5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Stat 3: Total Net Profit Gains */}
              <div className="bg-white p-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/40 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">TOTAL PROFIT GAINS</span>
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-emerald-700 tracking-tight">
                      +₹{totalProfitGains.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">Net Interest Income Yield</p>
                  </div>
                  <svg className="w-20 h-10 text-emerald-600 fill-current opacity-80" viewBox="0 0 100 40">
                    <path d="M0 25 Q20 35 50 10 T100 20 L100 40 L0 40 Z" fill="rgba(16, 185, 129, 0.2)" />
                    <path d="M0 25 Q20 35 50 10 T100 20" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Stat 4: Closed / Repaid Loans Count */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">CLOSED / REPAID LOANS</span>
                    <Info className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-purple-600 tracking-tight">
                      {closedLoans} Loans
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Fully settled loan applications</p>
                  </div>
                  <svg className="w-20 h-10 text-purple-500 fill-current opacity-80" viewBox="0 0 100 40">
                    <path d="M0 35 Q40 20 70 5 T100 15 L100 40 L0 40 Z" fill="rgba(168, 85, 247, 0.15)" />
                    <path d="M0 35 Q40 20 70 5 T100 15" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Middle Card 1: DYNAMIC PAST 6 MONTHS (Mar - Aug) PORTFOLIO GRAPH */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Portfolio Growth (Past 6 Months)</h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Live cumulative portfolio curve (Mar – Aug 2026)</p>
                  </div>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                    className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="This Month">This Month</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="This Year">This Year</option>
                  </select>
                </div>

                <div className="py-2 flex items-stretch gap-3">
                  <div className="flex flex-col justify-between h-44 text-[10px] font-bold text-slate-400 text-right pr-2 border-r border-slate-200 shrink-0">
                    <span>₹{maxTrendAmount.toLocaleString('en-IN')}</span>
                    <span>₹{Math.round(maxTrendAmount * 0.75).toLocaleString('en-IN')}</span>
                    <span>₹{Math.round(maxTrendAmount * 0.5).toLocaleString('en-IN')}</span>
                    <span>₹{Math.round(maxTrendAmount * 0.25).toLocaleString('en-IN')}</span>
                    <span>₹0</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="relative h-44 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 360 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={svgAreaD} fill="url(#chartGradient)" />
                        <path d={svgPathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                        {chartPoints.map((pt: any, idx: number) => (
                          <circle key={idx} cx={pt.x} cy={pt.y} r="5" fill="#2563eb" className="animate-pulse" />
                        ))}
                      </svg>
                    </div>

                    <div className="flex justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                      {chartPoints.map((pt: any, idx: number) => (
                        <span key={idx} className={idx === chartPoints.length - 1 ? 'text-blue-600 font-extrabold' : ''}>
                          {pt.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-blue-600" /> Aug Disbursed (Live)
                    </div>
                    <p className="font-extrabold text-slate-900 text-sm mt-1">₹{totalPortfolio.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Updated via 10s Polling</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Repaid (YTD)
                    </div>
                    <p className="font-extrabold text-slate-900 text-sm mt-1">₹{repaidTotal.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Settled Capital</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Outstanding
                    </div>
                    <p className="font-extrabold text-slate-900 text-sm mt-1">
                      ₹{Math.max(0, totalPortfolio - repaidTotal).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">In Active Recovery</p>
                  </div>
                </div>
              </div>

              {/* Middle Card 2: Loan Status Distribution Donut Chart */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Loan Status Distribution</h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Breakdown of all loan applications</p>
                </div>

                <div className="relative flex items-center justify-center my-auto">
                  {(() => {
                    const categorizedTotal = activeDisbursed + closedLoans + appliedLoans + rejectedLoans;
                    const chartBase = categorizedTotal > 0 ? categorizedTotal : totalLoans;

                    const pctActive = chartBase > 0 ? (activeDisbursed / chartBase) * 100 : 0;
                    const pctClosed = chartBase > 0 ? (closedLoans / chartBase) * 100 : 0;
                    const pctApplied = chartBase > 0 ? (appliedLoans / chartBase) * 100 : 0;
                    const pctRejected = chartBase > 0 ? (rejectedLoans / chartBase) * 100 : 0;

                    const offsetActive = 0;
                    const offsetClosed = -pctActive;
                    const offsetApplied = -(pctActive + pctClosed);
                    const offsetRejected = -(pctActive + pctClosed + pctApplied);

                    const circleD = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

                    return (
                      <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 36 36">
                        {/* Background track */}
                        <path d={circleD} fill="none" stroke="#f1f5f9" strokeWidth="4" />
                        
                        {/* 1. Active Disbursed (Blue) */}
                        {pctActive > 0 && (
                          <path
                            d={circleD}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="4.5"
                            strokeDasharray={`${pctActive}, 100`}
                            strokeDashoffset={offsetActive}
                          />
                        )}

                        {/* 2. Closed / Repaid (Green) */}
                        {pctClosed > 0 && (
                          <path
                            d={circleD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="4.5"
                            strokeDasharray={`${pctClosed}, 100`}
                            strokeDashoffset={offsetClosed}
                          />
                        )}

                        {/* 3. Applied / Lead (Red) */}
                        {pctApplied > 0 && (
                          <path
                            d={circleD}
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="4.5"
                            strokeDasharray={`${pctApplied}, 100`}
                            strokeDashoffset={offsetApplied}
                          />
                        )}

                        {/* 4. Rejected (Purple) */}
                        {pctRejected > 0 && (
                          <path
                            d={circleD}
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth="4.5"
                            strokeDasharray={`${pctRejected}, 100`}
                            strokeDashoffset={offsetRejected}
                          />
                        )}
                      </svg>
                    );
                  })()}

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-slate-900">{totalLoans}</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Total Loans</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-medium text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Active</span>
                    </div>
                    <span className="font-bold text-slate-900">{activeDisbursed} ({calcPct(activeDisbursed)}%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Closed / Repaid</span>
                    </div>
                    <span className="font-bold text-slate-900">{closedLoans} ({calcPct(closedLoans)}%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Applied / Lead</span>
                    </div>
                    <span className="font-bold text-slate-900">{appliedLoans} ({calcPct(appliedLoans)}%)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      <span>Rejected</span>
                    </div>
                    <span className="font-bold text-slate-900">{rejectedLoans} ({calcPct(rejectedLoans)}%)</span>
                  </div>
                </div>

                <button
                  onClick={() => setAllLoansModalOpen(true)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-blue-200 shadow-2xs"
                >
                  <Eye className="w-4 h-4" /> View All System Loans <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Middle Card 3: Recent Activities Feed */}
              <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Recent Activities</h3>
                  <button
                    onClick={() => setAuditLogsModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {(metrics?.recentActivities || []).length > 0 ? (
                    metrics.recentActivities.map((act: any, i: number) => (
                      <div key={i} className="flex items-start space-x-3 text-xs border-b pb-2 last:border-b-0">
                        <div className="p-2 rounded-xl bg-slate-100 text-blue-600 shrink-0 mt-0.5">
                          {act.action?.includes('SANCTION') ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          ) : act.action?.includes('DISBURSED') ? (
                            <Landmark className="w-4 h-4 text-purple-600" />
                          ) : act.action?.includes('PAYMENT') || act.action?.includes('REPAYMENT') ? (
                            <IndianRupee className="w-4 h-4 text-blue-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 leading-tight truncate">{act.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-semibold truncate">{act.action}</p>
                          <p className="text-[10px] text-blue-600 font-mono font-medium truncate">By: {act.performedBy}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">No recent activity logs recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Quick Access Navigation Cards */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Quick Access</h3>
                <p className="text-xs font-medium text-slate-400">Shortcuts to key module queues</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link
                  to="/dashboard/sales"
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Sales Queue</p>
                      <p className="text-[10px] text-slate-400 font-medium">View & manage leads</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/dashboard/sanction"
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Sanction</p>
                      <p className="text-[10px] text-slate-400 font-medium">Review & approve loans</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/dashboard/disbursement"
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Disbursement</p>
                      <p className="text-[10px] text-slate-400 font-medium">Track disbursement</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/dashboard/collection"
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Collection</p>
                      <p className="text-[10px] text-slate-400 font-medium">Monitor collections</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setAllLoansModalOpen(true)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between group text-left w-full"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">Master Portfolio</p>
                      <p className="text-[10px] text-slate-400 font-medium">View all loan records</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODAL 1: Master System Loan Portfolio Modal */}
      {allLoansModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Master System Loan Portfolio</h3>
                <p className="text-xs text-slate-500">Complete records of all borrower loans across system stages</p>
              </div>
              <button
                onClick={() => setAllLoansModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 shrink-0">
              <input
                type="text"
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                placeholder="Search loans by applicant name, PAN, email or status..."
                className="w-full max-w-sm px-3.5 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Showing {filteredAllLoans.length} of {allLoans.length} Loans
              </span>
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
              {loadingAllLoans ? (
                <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching master loan database...
                </div>
              ) : filteredAllLoans.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No matching loan records found.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-600 font-semibold sticky top-0 bg-slate-50 z-10">
                      <th className="p-3 whitespace-nowrap">Loan ID</th>
                      <th className="p-3 whitespace-nowrap">Borrower Profile</th>
                      <th className="p-3 whitespace-nowrap">Principal / Total Repayment</th>
                      <th className="p-3 whitespace-nowrap">Status</th>
                      <th className="p-3 whitespace-nowrap">Salary Slip Document</th>
                      <th className="p-3 whitespace-nowrap">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {filteredAllLoans.map((loan: any) => (
                      <tr key={loan._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 font-mono whitespace-nowrap">{loan._id}</td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{loan.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">PAN: {loan.pan || 'N/A'} | {loan.email}</p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-blue-600">₹{(loan.principalAmount || 0).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">
                            Total: ₹{(loan.totalRepayment || (loan.principalAmount * 1.06)).toLocaleString('en-IN')}
                          </p>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <StatusBadge status={loan.status} />
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {loan.salarySlipUrl ? (
                            <a
                              href={loan.salarySlipUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-lg transition-colors border border-blue-200/80"
                            >
                              <FileText className="w-3 h-3 text-blue-600" /> View Document <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">No Slip</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="text-right pt-2 border-t shrink-0">
              <button
                onClick={() => setAllLoansModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Close Master View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Full System Activity Audit Trail Modal */}
      {auditLogsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">System Audit Trail & Operations Feed</h3>
                  <p className="text-xs text-slate-500">Full historical log of all staff decisions, status transitions, and payments</p>
                </div>
              </div>
              <button
                onClick={() => setAuditLogsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-xl">
              {loadingAuditLogs ? (
                <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Fetching audit trail logs...
                </div>
              ) : allAuditLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No activity logs recorded yet.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-600 font-semibold sticky top-0 bg-slate-50 z-10">
                      <th className="p-3 whitespace-nowrap">Timestamp</th>
                      <th className="p-3 whitespace-nowrap">Borrower</th>
                      <th className="p-3 whitespace-nowrap">Action Type</th>
                      <th className="p-3 whitespace-nowrap">Officer & Role</th>
                      <th className="p-3 whitespace-nowrap">Remarks / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-medium">
                    {allAuditLogs.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{log.fullName}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/80">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{log.performedBy}</p>
                          <p className="text-[10px] text-blue-600 font-mono">{log.performedByEmail}</p>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {log.notes || 'Processed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="text-right pt-2 border-t shrink-0">
              <button
                onClick={() => setAuditLogsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
