import mongoose from 'mongoose';
import { CONFIG } from './constants';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('  ✅ MongoDB connected successfully');
  } catch (error) {
    console.error('  ❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
