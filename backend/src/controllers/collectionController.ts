import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Loan, LoanStatus } from '../models/Loan';
import { Payment } from '../models/Payment';

export const getCollectionLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    let filter = {};

    if (type === 'history') {
      filter = { status: LoanStatus.CLOSED };
    } else {
      filter = { status: LoanStatus.DISBURSED };
    }

    const loans = await Loan.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(loans);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch collection loans queue', error: error.message });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId, utrNumber, amount, paymentDate } = req.body;

    if (!utrNumber || !String(utrNumber).trim()) {
      res.status(400).json({ message: 'UTR Number is required to record payment.' });
      return;
    }

    let trimmedUtr = String(utrNumber).trim();
    if (trimmedUtr.startsWith('#')) {
      trimmedUtr = trimmedUtr.substring(1).trim();
    }
    if (trimmedUtr.toUpperCase().startsWith('UTR#')) {
      trimmedUtr = 'UTR' + trimmedUtr.substring(4).trim();
    }

    // STRICT UTR FORMAT REGEX: Optional bank/UTR prefix followed strictly by exactly 12 numeric digits
    const utrFormatRegex = /^(UTR|[A-Z]{3,4})?[0-9]{12}$/i;
    if (!utrFormatRegex.test(trimmedUtr)) {
      res.status(400).json({
        message: 'Invalid UTR format. Bank UTR must consist of strictly 12 numeric digits (e.g. UTR984102948120 or 984102948120).',
      });
      return;
    }

    const utrRegex = new RegExp(`^${trimmedUtr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== LoanStatus.DISBURSED) {
      res.status(404).json({ message: 'Active disbursed loan not found' });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({ message: 'Payment amount must be greater than zero' });
      return;
    }

    const outstandingBalance = (loan.totalRepayment || 0) - loan.totalPaidAmount;
    if (amount > outstandingBalance + 0.05) {
      res.status(422).json({
        message: `Payment amount ₹${amount} exceeds remaining balance ₹${outstandingBalance.toFixed(2)}`,
      });
      return;
    }

    // CROSS-SYSTEM SAFETY GUARD: Search both Payment collection AND Loan disbursed UTRs (case-insensitive & audit trail notes)
    const existingPayment = await Payment.findOne({ utrNumber: utrRegex });
    const existingDisbursedUtr = await Loan.findOne({
      $or: [
        { disbursedUtr: utrRegex },
        { 'auditTrail.notes': new RegExp(`UTR\\s*#?\\s*${trimmedUtr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
      ],
    });

    if (existingPayment || existingDisbursedUtr) {
      res.status(409).json({
        message: `UTR Number '#${trimmedUtr}' has already been processed in another transaction. Duplicate UTRs are strictly forbidden.`,
      });
      return;
    }

    await Payment.create({
      loanId,
      utrNumber: trimmedUtr,
      amount,
      paymentDate: paymentDate || new Date(),
      recordedBy: req.user!.id,
    });

    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      {
        $inc: { totalPaidAmount: amount },
        $push: {
          auditTrail: {
            action: 'REPAYMENT_RECORDED',
            performedBy: req.user?.name,
            performedByEmail: req.user?.email,
            performedByRole: req.user?.role,
            timestamp: new Date(),
            notes: `Recorded repayment of ₹${amount.toLocaleString('en-IN')} via UTR #${trimmedUtr}`,
          },
        },
      },
      { new: true }
    );

    // If fully paid off, auto-close the loan
    if (updatedLoan && updatedLoan.totalPaidAmount >= (updatedLoan.totalRepayment || 0) - 0.05) {
      updatedLoan.status = LoanStatus.CLOSED;
      updatedLoan.closedAt = new Date();
      updatedLoan.auditTrail.push({
        action: 'LOAN_CLOSED',
        performedBy: 'SYSTEM_AUTOMATION',
        performedByRole: 'SYSTEM',
        timestamp: new Date(),
        notes: `Loan balance fully settled (₹${updatedLoan.totalPaidAmount.toLocaleString('en-IN')}). Status transitioned to CLOSED.`,
      });
      await updatedLoan.save();
    }

    res.status(200).json({ message: 'Payment recorded successfully', loan: updatedLoan });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to record payment', error: error.message });
  }
};
