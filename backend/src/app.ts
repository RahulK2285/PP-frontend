import express from 'express';
import cors from 'cors';
import { CONFIG } from './config/constants';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import dsaRoutes from './modules/dsa/dsa.routes';
import resumeRoutes from './modules/resume/resume.routes';
import referralRoutes from './modules/referrals/referral.routes';
import recommendationRoutes from './modules/recommendations/recommendations.routes';

const app = express();

// ─── Middleware ───
// Support multiple CLIENT_URL origins (comma-separated) for production
const allowedOrigins = CONFIG.CLIENT_URL.split(',').map(u => u.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(CONFIG.UPLOAD_DIR));

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/problems', dsaRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
async function start() {
  await connectDB();

    const PORT = process.env.PORT || CONFIG.PORT || 5000;

  // Bind to 0.0.0.0 — required by Render and other cloud hosts
  app.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 PrepForge API running on port ${CONFIG.PORT}`);
    console.log(`  📊 MongoDB: ${CONFIG.MONGODB_URI}\n`);
  });
}

start().catch(console.error);

