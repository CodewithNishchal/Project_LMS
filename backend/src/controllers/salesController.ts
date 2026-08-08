import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Loan, LoanStatus } from '../models/Loan';
import { User, UserRole } from '../models/User';
import { Types } from 'mongoose';

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch emails of borrowers who have ALREADY applied / sanctioned / disbursed / closed / rejected a loan
    const appliedLoanRecords = await Loan.find({
      status: { $nin: [LoanStatus.LEAD, LoanStatus.LEAD_ENGAGED] },
    }).select('email borrowerId');

    const appliedEmails = new Set(
      appliedLoanRecords.map((l) => l.email.toLowerCase().trim())
    );
    const appliedUserIds = new Set(
      appliedLoanRecords.filter((l) => l.borrowerId).map((l) => l.borrowerId!.toString())
    );

    // 2. Fetch explicit LEAD and LEAD_ENGAGED records from Loan collection
    const loanLeads = await Loan.find({
      status: { $in: [LoanStatus.LEAD, LoanStatus.LEAD_ENGAGED] },
    }).sort({ updatedAt: -1 });

    // Filter out any lead that has now applied
    const activeLoanLeads = loanLeads.filter(
      (l) => !appliedEmails.has(l.email.toLowerCase().trim())
    );

    // 3. Fetch all registered BORROWER users
    const borrowerUsers = await User.find({ role: UserRole.BORROWER }).sort({ createdAt: -1 });

    const existingLeadEmails = new Set(activeLoanLeads.map((l) => l.email.toLowerCase().trim()));

    // 4. Create virtual leads ONLY for registered users who have NOT applied for a loan yet
    const virtualUserLeads = borrowerUsers
      .filter((u) => {
        const userEmail = u.email.toLowerCase().trim();
        const userIdStr = u._id.toString();
        return (
          !appliedEmails.has(userEmail) &&
          !appliedUserIds.has(userIdStr) &&
          !existingLeadEmails.has(userEmail)
        );
      })
      .map((u) => ({
        _id: u._id,
        fullName: u.name,
        email: u.email,
        phone: u.phone || '9876543210',
        monthlySalary: undefined, // Unapplied leads have not filled income step yet
        status: LoanStatus.LEAD,
        createdAt: (u as any).createdAt || new Date(),
        isVirtualLead: true,
      }));

    // Combine active leads and virtual leads
    const allLeads = [...activeLoanLeads, ...virtualUserLeads];

    const unappliedLeads = allLeads.filter((l: any) => l.status === LoanStatus.LEAD);
    const engagedLeads = allLeads.filter((l: any) => l.status === LoanStatus.LEAD_ENGAGED);

    res.status(200).json({
      all: allLeads,
      unapplied: unappliedLeads,
      engaged: engagedLeads,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch sales leads', error: error.message });
  }
};

export const toggleEngageLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId, action } = req.body; // action: 'ENGAGE' | 'BRING_BACK'

    let existingLead = null;
    if (Types.ObjectId.isValid(leadId)) {
      existingLead = await Loan.findById(leadId);
    }

    // If virtual user lead or not found in Loan collection, create Loan record first
    if (!existingLead) {
      const user = Types.ObjectId.isValid(leadId) ? await User.findById(leadId) : null;
      if (user) {
        const newStatus = action === 'BRING_BACK' ? LoanStatus.LEAD : LoanStatus.LEAD_ENGAGED;
        existingLead = await Loan.create({
          borrowerId: user._id,
          fullName: user.name,
          email: user.email,
          phone: user.phone || '9876543210',
          monthlySalary: undefined,
          status: newStatus,
          auditTrail: [
            {
              action: action === 'BRING_BACK' ? 'LEAD_RESTORED' : 'LEAD_ENGAGED',
              performedBy: req.user?.name,
              performedByRole: req.user?.role,
              timestamp: new Date(),
              notes:
                action === 'BRING_BACK'
                  ? 'Sales Executive restored lead back to unapplied queue.'
                  : 'Sales Executive marked lead as actively engaged.',
            },
          ],
        });

        res.status(200).json({ message: 'Lead status updated', loan: existingLead });
        return;
      }

      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    const targetStatus = action === 'BRING_BACK' ? LoanStatus.LEAD : LoanStatus.LEAD_ENGAGED;

    const updatedLoan = await Loan.findByIdAndUpdate(
      existingLead._id,
      {
        status: targetStatus,
        $push: {
          auditTrail: {
            action: action === 'BRING_BACK' ? 'LEAD_RESTORED' : 'LEAD_ENGAGED',
            performedBy: req.user?.name,
            performedByRole: req.user?.role,
            timestamp: new Date(),
            notes:
              action === 'BRING_BACK'
                ? 'Sales Executive restored lead back to unapplied queue.'
                : 'Sales Executive marked lead as actively engaged.',
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Lead status updated', loan: updatedLoan });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update lead engagement state', error: error.message });
  }
};

export const convertLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.body;

    let existingLead = null;
    if (Types.ObjectId.isValid(leadId)) {
      existingLead = await Loan.findById(leadId);
    }

    if (!existingLead) {
      const user = Types.ObjectId.isValid(leadId) ? await User.findById(leadId) : null;
      if (user) {
        existingLead = await Loan.create({
          borrowerId: user._id,
          fullName: user.name,
          email: user.email,
          phone: user.phone || '9876543210',
          monthlySalary: 50000,
          principalAmount: 100000,
          tenureDays: 180,
          interestRate: 12,
          simpleInterest: 5917.81,
          totalRepayment: 105917.81,
          status: LoanStatus.APPLIED,
          auditTrail: [
            {
              action: 'LEAD_CONVERTED',
              performedBy: req.user?.name,
              performedByRole: req.user?.role,
              timestamp: new Date(),
              notes: 'Sales Executive converted registered user lead into active loan application.',
            },
          ],
        });

        res.status(200).json({ message: 'Registered user converted to active loan application', loan: existingLead });
        return;
      }

      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    const loan = await Loan.findByIdAndUpdate(
      existingLead._id,
      {
        status: LoanStatus.APPLIED,
        $push: {
          auditTrail: {
            action: 'LEAD_CONVERTED',
            performedBy: req.user?.name,
            performedByRole: req.user?.role,
            timestamp: new Date(),
            notes: 'Sales Executive manually converted lead into active application.',
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Lead converted to application', loan });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to convert lead', error: error.message });
  }
};
