import mongoose, { Document, Schema } from 'mongoose';

interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: 'good' | 'warning' | 'bad';
}

export interface IResumeScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  categories: ScoreCategory[];
  tips: string[];
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  score?: IResumeScore;
  createdAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    score: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
