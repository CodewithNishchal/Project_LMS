import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Loan, LoanStatus } from '../models/Loan';
import { User } from '../models/User';

export const getAdminMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeDisbursed = await Loan.countDocuments({ status: LoanStatus.DISBURSED });
    const closedLoans = await Loan.countDocuments({ status: LoanStatus.CLOSED });
    const appliedLoans = await Loan.countDocuments({ status: { $in: [LoanStatus.APPLIED, LoanStatus.LEAD] } });
    const rejectedLoans = await Loan.countDocuments({ status: LoanStatus.REJECTED });
    const staffCount = await User.countDocuments();

    // 1. Total Disbursed Portfolio Value (Sum of principalAmount for DISBURSED & CLOSED loans)
    const portfolioAggregation = await Loan.aggregate([
      { $match: { status: { $in: [LoanStatus.DISBURSED, LoanStatus.CLOSED] } } },
      { $group: { _id: null, total: { $sum: '$principalAmount' } } },
    ]);
    const totalPortfolioValue = portfolioAggregation[0]?.total || 0;

    // 2. Total Collections Repaid (Sum of totalPaidAmount across all loans)
    const repaidAggregation = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPaidAmount' } } },
    ]);
    const repaidTotal = repaidAggregation[0]?.total || 0;

    // 3. Total Net Profit Gains (Interest Yield Earned)
    // Aggregates principal of closed/partially repaid loans
    const closedPrincipalAggregation = await Loan.aggregate([
      { $match: { status: LoanStatus.CLOSED } },
      { $group: { _id: null, totalPrincipal: { $sum: '$principalAmount' } } },
    ]);
    const closedPrincipal = closedPrincipalAggregation[0]?.totalPrincipal || 0;

    const totalProfitGains = Math.max(0, Math.round((repaidTotal - closedPrincipal) * 100) / 100);

    // Flatten ALL individual audit log entries across all loans to show complete activity history
    const allLoansWithAudit = await Loan.find({ 'auditTrail.0': { $exists: true } });
    const allActivities: any[] = [];
    
    allLoansWithAudit.forEach((l) => {
      l.auditTrail.forEach((audit) => {
        allActivities.push({
          id: l._id,
          fullName: l.fullName,
          action: audit.action,
          performedBy: audit.performedBy || 'System',
          performedByEmail: audit.performedByEmail || 'admin@creditsea.com',
          timestamp: audit.timestamp || l.updatedAt,
          notes: audit.notes || '',
        });
      });
    });

    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = allActivities.slice(0, 8);

    // Past 6 Months Dynamic Trend: Mar, Apr, May, Jun, Jul = 0; Aug (Current Month) = live totalPortfolioValue
    const monthsList = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const monthlyTrends = monthsList.map((month, idx) => {
      if (idx === monthsList.length - 1) {
        return { label: month, amount: totalPortfolioValue };
      }
      return { label: month, amount: 0 };
    });

    res.status(200).json({
      totalLoans,
      activeDisbursed,
      closedLoans,
      appliedLoans,
      rejectedLoans,
      staffCount,
      totalPortfolioValue,
      repaidTotal,
      totalProfitGains,
      recentActivities,
      monthlyTrends,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch admin metrics', error: error.message });
  }
};

export const getAllLoansAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find().sort({ updatedAt: -1 });
    res.status(200).json(loans);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch all loans for admin', error: error.message });
  }
};

export const getAllAuditLogsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ 'auditTrail.0': { $exists: true } })
      .select('_id fullName email phone status auditTrail updatedAt')
      .sort({ updatedAt: -1 });

    const allLogs: any[] = [];
    loans.forEach((loan) => {
      loan.auditTrail.forEach((audit) => {
        allLogs.push({
          loanId: loan._id,
          fullName: loan.fullName,
          email: loan.email,
          phone: loan.phone,
          status: loan.status,
          action: audit.action,
          performedBy: audit.performedBy || 'System',
          performedByEmail: audit.performedByEmail || 'admin@creditsea.com',
          performedByRole: audit.performedByRole || 'OFFICER',
          timestamp: audit.timestamp,
          notes: audit.notes || '',
        });
      });
    });

    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json(allLogs);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch all audit logs', error: error.message });
  }
};
