export enum UserRole {
  BORROWER = 'BORROWER',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
  ADMIN = 'ADMIN'
}

export enum LoanStatus {
  LEAD = 'LEAD',
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  DISBURSED = 'DISBURSED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED'
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface IBorrowerProfile {
  id: string;
  pan: string;
  dob: string;
  monthlyIncome: number;
  employmentType: 'SALARIED' | 'SELF_EMPLOYED';
  organizationName?: string;
  salarySlipUrl?: string;
  breResult?: {
    approved: boolean;
    maxLimit: number;
    recommendedRate: number;
    reason?: string;
  };
}

export interface ILoan {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  status: LoanStatus;
  requestedAmount: number;
  principalAmount: number;
  interestRate: number;
  tenureDays: number;
  calculatedInterest: number;
  totalRepayment: number;
  outstandingBalance: number;
  totalPaid: number;
  disbursedBankAcount?: string;
  disbursedUtr?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: IBorrowerProfile;
  auditTrail?: {
    action: string;
    performedBy: string;
    performedByRole: UserRole;
    timestamp: string;
    notes?: string;
  }[];
  payments?: {
    id: string;
    utrNumber: string;
    amount: number;
    paymentDate: string;
    recordedBy: string;
  }[];
}
