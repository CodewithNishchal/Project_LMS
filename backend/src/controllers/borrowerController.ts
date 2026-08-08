import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Loan, LoanStatus, BREStatus } from '../models/Loan';
import { Payment } from '../models/Payment';
import { uploadPdfToCloudinary } from '../services/cloudinaryService';
import { Types } from 'mongoose';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const calculateAge = (dob: Date | string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const applyForLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phone,
      pan,
      dob,
      monthlySalary,
      employmentMode,
      organizationName,
      salarySlipUrl,
      principalAmount,
      tenureDays,
    } = req.body;

    if (pan && !PAN_REGEX.test(pan.toUpperCase().trim())) {
      res.status(400).json({ message: 'Please provide a valid 10-character Indian PAN card number (e.g. ABCDE1234F).' });
      return;
    }

    if (employmentMode === 'UNEMPLOYED') {
      res.status(400).json({ message: 'Unemployed applicants are ineligible for personal loan approval.' });
      return;
    }

    if (monthlySalary && Number(monthlySalary) < 25000) {
      res.status(400).json({ message: 'Monthly salary must be strictly ₹25,000 or higher to apply for a loan.' });
      return;
    }

    // Age BRE Rule Calculation (23 to 50 Years Old)
    let breStatusResult = BREStatus.PASSED;
    let breNotes = 'Automated BRE Evaluation: PASSED. Salary and age rules satisfied.';

    if (dob) {
      const age = calculateAge(dob);
      if (age < 23 || age > 50) {
        breStatusResult = BREStatus.REJECTED;
        breNotes = `Automated BRE Evaluation: REJECTED. Borrower age (${age} yrs) outside eligible range of 23-50 years.`;
      }
    }

    const principal = Number(principalAmount) || 100000;
    const tenure = Number(tenureDays) || 180;
    const rate = 12; // 12% p.a. fixed
    const simpleInterest = Number(((principal * rate * tenure) / (365 * 100)).toFixed(2));
    const totalRepayment = Number((principal + simpleInterest).toFixed(2));

    const finalStatus = breStatusResult === BREStatus.REJECTED ? LoanStatus.REJECTED : LoanStatus.APPLIED;

    const userEmail = (email || req.user?.email || '').toLowerCase().trim();

    // Check if there is an existing LEAD loan record created at user registration
    const existingLead = await Loan.findOne({
      $or: [
        ...(req.user?.id && Types.ObjectId.isValid(req.user.id) ? [{ borrowerId: new Types.ObjectId(req.user.id) }] : []),
        { email: new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ],
      status: { $in: [LoanStatus.LEAD, LoanStatus.LEAD_ENGAGED] },
    });

    let loan;
    if (existingLead) {
      // Update existing lead into full APPLIED loan record
      existingLead.borrowerId = (req.user?.id as any) || existingLead.borrowerId;
      existingLead.fullName = fullName.trim();
      existingLead.email = userEmail;
      existingLead.phone = phone ? phone.trim() : existingLead.phone;
      existingLead.pan = pan ? pan.toUpperCase().trim() : undefined;
      existingLead.dob = dob ? new Date(dob) : undefined;
      existingLead.monthlySalary = Number(monthlySalary);
      existingLead.employmentMode = employmentMode;
      existingLead.organizationName = organizationName ? organizationName.trim() : undefined;
      existingLead.salarySlipUrl = salarySlipUrl;
      existingLead.principalAmount = principal;
      existingLead.tenureDays = tenure;
      existingLead.interestRate = rate;
      existingLead.simpleInterest = simpleInterest;
      existingLead.totalRepayment = totalRepayment;
      existingLead.breStatus = breStatusResult;
      existingLead.status = finalStatus;

      existingLead.auditTrail.push({
        action: 'APPLICATION_SUBMITTED',
        performedBy: req.user?.name || fullName,
        performedByRole: 'BORROWER',
        timestamp: new Date(),
        notes: `Borrower submitted loan application for ₹${principal.toLocaleString('en-IN')}. ${breNotes}`,
      });

      loan = await existingLead.save();
    } else {
      // Create new loan application record
      loan = await Loan.create({
        borrowerId: req.user?.id,
        fullName: fullName.trim(),
        email: userEmail,
        phone: phone ? phone.trim() : '9876543210',
        pan: pan ? pan.toUpperCase().trim() : undefined,
        dob: dob ? new Date(dob) : undefined,
        monthlySalary: Number(monthlySalary),
        employmentMode,
        organizationName: organizationName ? organizationName.trim() : undefined,
        salarySlipUrl,
        principalAmount: principal,
        tenureDays: tenure,
        interestRate: rate,
        simpleInterest,
        totalRepayment,
        breStatus: breStatusResult,
        status: finalStatus,
        auditTrail: [
          {
            action: 'APPLICATION_SUBMITTED',
            performedBy: req.user?.name || fullName,
            performedByRole: 'BORROWER',
            timestamp: new Date(),
            notes: `Borrower submitted loan application for ₹${principal.toLocaleString('en-IN')}. ${breNotes}`,
          },
        ],
      });
    }

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
};

export const getMyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email ? req.user.email.toLowerCase().trim() : '';

    if (!userId && !userEmail) {
      res.status(401).json({ message: 'User unauthorized' });
      return;
    }

    const queryConditions: any[] = [];
    if (userId && Types.ObjectId.isValid(userId)) {
      queryConditions.push({ borrowerId: new Types.ObjectId(userId) });
      queryConditions.push({ borrowerId: userId });
    }
    if (userEmail) {
      queryConditions.push({ email: new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    }

    const loans = await Loan.find({
      $or: queryConditions.length > 0 ? queryConditions : [{ email: userEmail }],
    }).sort({ createdAt: -1 });

    const latestLoan = loans[0] || null;

    // Safe Auto-Repair for legacy test loans: Ensures zero 500 errors on duplicate key checks
    if (latestLoan && (latestLoan.status === LoanStatus.DISBURSED || latestLoan.status === LoanStatus.CLOSED)) {
      if (!latestLoan.disbursedUtr || String(latestLoan.disbursedUtr).includes('[object Object]')) {
        try {
          const repairedUtr = `UTR${latestLoan._id.toString().substring(12).toUpperCase()}`;
          latestLoan.disbursedUtr = repairedUtr;
          await Loan.findByIdAndUpdate(latestLoan._id, { disbursedUtr: repairedUtr });
        } catch (repairErr) {
          // Ignore duplicate UTR error safely if already in DB
        }
      }
    }

    let payments: any[] = [];
    if (latestLoan) {
      payments = await Payment.find({ loanId: latestLoan._id }).sort({ paymentDate: -1 });
    }

    res.status(200).json({
      activeLoan: latestLoan,
      loan: latestLoan,
      loans,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch borrower loan details', error: error.message });
  }
};

export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No document file uploaded' });
      return;
    }

    const result = await uploadPdfToCloudinary(file.buffer, file.originalname);
    res.status(200).json({
      message: 'Salary slip uploaded successfully',
      fileUrl: result.url,
      isCloudinary: result.isCloudinary,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Document upload failed', error: error.message });
  }
};
