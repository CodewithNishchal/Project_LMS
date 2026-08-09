import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Loan, LoanStatus } from '../models/Loan';
import { Payment } from '../models/Payment';

export const getDisbursementQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    let filter = {};

    if (type === 'history') {
      filter = {
        $or: [
          { status: { $in: [LoanStatus.DISBURSED, LoanStatus.CLOSED] } },
          { 'auditTrail.action': { $in: ['DISBURSEMENT_RELEASED', 'DISBURSEMENT_REJECTED'] } },
        ],
      };
    } else {
      filter = { status: LoanStatus.SANCTIONED };
    }

    const loans = await Loan.find(filter).sort({ updatedAt: -1 });
    res.status(200).json(loans);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch disbursement queue', error: error.message });
  }
};

export const releaseDisbursement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId, notes } = req.body;
    let rawUtr = req.body.utr || req.body.utrNumber;

    if (typeof rawUtr === 'object' && rawUtr !== null) {
      rawUtr = rawUtr.utr || rawUtr.utrNumber || rawUtr.value || '';
    }

    let trimmedUtr = String(rawUtr || '').trim();
    if (trimmedUtr === '[object Object]') {
      trimmedUtr = '';
    }

    if (trimmedUtr.startsWith('#')) {
      trimmedUtr = trimmedUtr.substring(1).trim();
    }
    if (trimmedUtr.toUpperCase().startsWith('UTR#')) {
      trimmedUtr = 'UTR' + trimmedUtr.substring(4).trim();
    }

    if (!trimmedUtr) {
      res.status(400).json({ message: 'Bank Transfer UTR Number is mandatory to execute disbursement.' });
      return;
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

    // CROSS-SYSTEM SAFETY GUARD: Verify UTR is not already used in any loan or payment record
    const duplicateLoanUtr = await Loan.findOne({
      $or: [
        { disbursedUtr: utrRegex },
        { 'auditTrail.notes': new RegExp(`UTR\\s*#?\\s*${trimmedUtr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') },
      ],
    });
    const duplicatePaymentUtr = await Payment.findOne({ utrNumber: utrRegex });

    if (duplicateLoanUtr || duplicatePaymentUtr) {
      res.status(409).json({
        message: `UTR Number '#${trimmedUtr}' has already been processed in another transaction. Duplicate UTRs are strictly forbidden.`,
      });
      return;
    }

    const existingLoan = await Loan.findById(loanId);
    if (!existingLoan) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }

    if (existingLoan.status !== LoanStatus.SANCTIONED) {
      res.status(400).json({ message: `Cannot release disbursement for loan with status '${existingLoan.status}'. Loan must be in SANCTIONED status.` });
      return;
    }

    const loan = await Loan.findByIdAndUpdate(
      loanId,
      {
        status: LoanStatus.DISBURSED,
        disbursedUtr: trimmedUtr,
        disbursedBy: req.user?.id,
        disbursedAt: new Date(),
        $push: {
          auditTrail: {
            action: 'DISBURSEMENT_RELEASED',
            performedBy: req.user?.name,
            performedByEmail: req.user?.email,
            performedByRole: req.user?.role,
            timestamp: new Date(),
            notes: `Disbursed funds via UTR #${trimmedUtr}. ${notes ? `Remarks: ${notes}` : ''}`,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Disbursement released successfully', loan });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to release disbursement', error: error.message });
  }
};

export const rejectDisbursement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId, notes } = req.body;

    if (!notes || !notes.trim()) {
      res.status(400).json({ message: 'Rejection reason/remarks are mandatory.' });
      return;
    }

    const existingLoan = await Loan.findById(loanId);
    if (!existingLoan) {
      res.status(404).json({ message: 'Loan application not found' });
      return;
    }

    if (existingLoan.status !== LoanStatus.SANCTIONED) {
      res.status(400).json({ message: `Cannot reject loan with status '${existingLoan.status}'. Loan must be in SANCTIONED status.` });
      return;
    }

    const loan = await Loan.findByIdAndUpdate(
      loanId,
      {
        status: LoanStatus.REJECTED,
        $push: {
          auditTrail: {
            action: 'DISBURSEMENT_REJECTED',
            performedBy: req.user?.name,
            performedByEmail: req.user?.email,
            performedByRole: req.user?.role,
            timestamp: new Date(),
            notes: `Disbursement rejected by ${req.user?.name} (${req.user?.email || 'officer'}): ${notes}`,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Disbursement application rejected', loan });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to reject disbursement', error: error.message });
  }
};
