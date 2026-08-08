import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import fs from 'fs';

import authRoutes from './routes/authRoutes';
import borrowerRoutes from './routes/borrowerRoutes';
import salesRoutes from './routes/salesRoutes';
import sanctionRoutes from './routes/sanctionRoutes';
import disbursementRoutes from './routes/disbursementRoutes';
import collectionRoutes from './routes/collectionRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();
const app = express();

// Serverless-safe upload directory creation
try {
  const uploadDir = path.join('/tmp', 'slips');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  // Ignore read-only filesystem errors in serverless environments (Vercel)
}

// Permissive CORS setup for production & local environments
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join('/tmp')));

app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sanction', sanctionRoutes);
app.use('/api/disbursement', disbursementRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', environment: process.env.NODE_ENV || 'production' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    if (require.main === module || process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 LMS Backend Server running on http://localhost:${PORT}`);
      });
    }
  });
}

export default app;
