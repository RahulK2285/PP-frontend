import mongoose, { Document, Schema } from 'mongoose';

export type ReferralStatus = 'Applied' | 'Under Review' | 'Referral Sent' | 'Interview Set' | 'Rejected';

export interface IReferral extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  message: string;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Referral Sent', 'Interview Set', 'Rejected'],
      default: 'Applied',
    },
  },
  { timestamps: true }
);

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
