// ─── User ───
export interface User {
  id: string;
  name: string;
  email: string;
  leetcodeUsername?: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ─── Problem ───
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Solved' | 'Attempted' | 'Todo';
export type ProblemSource = 'manual' | 'leetcode';

export const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP',
  'Binary Search', 'Backtracking', 'Stack', 'Queue', 'Heap',
  'Greedy', 'Math', 'Bit Manipulation', 'Two Pointers',
  'Sliding Window', 'Trie', 'Hash Table', 'Sorting', 'Other',
] as const;

export type Topic = typeof TOPICS[number];

export interface Problem {
  _id: string;
  userId: string;
  title: string;
  titleSlug?: string;
  topic: Topic;
  difficulty: Difficulty;
  status: ProblemStatus;
  source: ProblemSource;
  leetcodeId?: string;
  url?: string;
  notes?: string;
  solvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ───
export interface TopicCount {
  solved: number;
  attempted: number;
  todo: number;
}

export interface Analytics {
  topicCounts: Record<string, TopicCount>;
  difficultyCounts: { Easy: number; Medium: number; Hard: number };
  statusCounts: { Solved: number; Attempted: number; Todo: number };
  weeklyData: { week: string; count: number }[];
  heatmapData: Record<string, number>;
  streak: { current: number; longest: number; totalActiveDays: number };
  totalProblems: number;
}

// ─── Resume ───
export interface ResumeScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: 'good' | 'warning' | 'bad';
}

export interface ResumeScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  categories: ResumeScoreCategory[];
  tips: string[];
}

export interface Resume {
  _id: string;
  userId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  score?: ResumeScore | null;
  createdAt: string;
}

// ─── Referral ───
export type ReferralStatus = 'Applied' | 'Under Review' | 'Referral Sent' | 'Interview Set' | 'Rejected';

export interface Referral {
  _id: string;
  userId: string;
  company: string;
  role: string;
  message: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Recommendation ───
export interface Recommendation {
  topic: string;
  level: 'weak' | 'moderate' | 'strong';
  solved: number;
  target: number;
  percentage: number;
  suggestions: string[];
}

// ─── LeetCode Sync Result ───
export interface SyncResult {
  synced: number;
  skipped: number;
  total: number;
  submissions: {
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
  }[];
}
