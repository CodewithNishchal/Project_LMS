import { Schema, model, Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
  BORROWER = 'BORROWER',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false }, // Prevent password hash leaks, optional for test seeds
    phone: { type: String, trim: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.BORROWER, required: true },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
