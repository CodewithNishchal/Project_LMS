import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  loanId: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
    utrNumber: { type: String, required: true, unique: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, default: Date.now, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
