import dotenv from 'dotenv';
import path from 'path';

// Load .env — try server root first, then monorepo root (Render injects env vars directly)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepforge',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_me',
  JWT_EXPIRY: '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  LEETCODE_GQL: process.env.LEETCODE_GQL || 'https://leetcode.com/graphql',
  UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
};
