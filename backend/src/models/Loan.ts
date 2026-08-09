import { Schema, model, Document, Types } from 'mongoose';

export enum EmploymentMode {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
}

export enum BREStatus {
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
}

export enum LoanStatus {
  LEAD = 'LEAD',
  LEAD_ENGAGED = 'LEAD_ENGAGED',
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export interface IAuditLog {
  action: string;
  performedBy?: string;
  performedByEmail?: string;
  performedByRole?: string;
  timestamp: Date;
  notes?: string;
}

export interface IAiAnalysis {
  hasAiInference: boolean;
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
  riskScore: number;
  aiRecommendation: 'RECOMMEND_SANCTION' | 'NEEDS_MANUAL_REVIEW' | 'RECOMMEND_REJECTION';
  summary: string;
  keyInsights: string[];
  slipAnalysis?: {
    documentType: string;
    verifiedIncome?: string;
    employerMatch?: string;
    documentAuthenticity?: string;
  };
  modelUsed?: string;
  isAiGenerated: boolean;
  analyzedAt?: Date;
}

export interface ILoan extends Document {
  _id: Types.ObjectId;
  borrowerId?: Types.ObjectId | null;
  fullName: string;
  email: string;
  phone: string;
  pan?: string | null;
  dob?: Date | null;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  organizationName?: string;
  salarySlipUrl?: string;
  principalAmount?: number;
  tenureDays?: number;
  interestRate?: number;
  simpleInterest?: number;
  totalRepayment?: number;
  totalPaidAmount: number;
  breStatus: BREStatus;
  status: LoanStatus;
  sanctionedBy?: Types.ObjectId | null;
  sanctionedAt?: Date;
  disbursedBy?: Types.ObjectId | null;
  disbursedAt?: Date;
  disbursedUtr?: string;
  auditTrail: IAuditLog[];
  aiAnalysis?: IAiAnalysis;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  performedBy: { type: String },
  performedByEmail: { type: String },
  performedByRole: { type: String },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
});

const LoanSchema = new Schema<ILoan>(
  {
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    pan: { type: String, uppercase: true, trim: true },
    dob: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: {
      type: String,
      enum: Object.values(EmploymentMode),
      default: EmploymentMode.SALARIED,
    },
    organizationName: { type: String, trim: true },
    salarySlipUrl: { type: String },
    principalAmount: { type: Number },
    tenureDays: { type: Number },
    interestRate: { type: Number, default: 12 },
    simpleInterest: { type: Number },
    totalRepayment: { type: Number },
    totalPaidAmount: { type: Number, default: 0 },
    breStatus: {
      type: String,
      enum: Object.values(BREStatus),
      default: BREStatus.PASSED,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      default: LoanStatus.LEAD,
      index: true,
    },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sanctionedAt: { type: Date },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    disbursedAt: { type: Date },
    disbursedUtr: { type: String, trim: true },
    auditTrail: [AuditLogSchema],
    aiAnalysis: { type: Schema.Types.Mixed },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const Loan = model<ILoan>('Loan', LoanSchema);
