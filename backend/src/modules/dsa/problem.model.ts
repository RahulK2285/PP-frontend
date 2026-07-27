import mongoose, { Document, Schema } from 'mongoose';

export interface IProblem extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  titleSlug?: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Attempted' | 'Todo';
  source: 'manual' | 'leetcode';
  leetcodeId?: string;
  url?: string;
  notes?: string;
  solvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
    },
    titleSlug: {
      type: String,
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      enum: [
        'Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP',
        'Binary Search', 'Backtracking', 'Stack', 'Queue', 'Heap',
        'Greedy', 'Math', 'Bit Manipulation', 'Two Pointers',
        'Sliding Window', 'Trie', 'Hash Table', 'Sorting', 'Other',
      ],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Solved', 'Attempted', 'Todo'],
      default: 'Todo',
    },
    source: {
      type: String,
      enum: ['manual', 'leetcode'],
      default: 'manual',
    },
    leetcodeId: String,
    url: String,
    notes: String,
    solvedAt: Date,
  },
  { timestamps: true }
);

// Compound index for deduplication on LeetCode sync
problemSchema.index({ userId: 1, titleSlug: 1 }, { unique: true, sparse: true });

export const Problem = mongoose.model<IProblem>('Problem', problemSchema);
