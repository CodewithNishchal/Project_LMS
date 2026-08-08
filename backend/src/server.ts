import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import borrowerRoutes from './routes/borrowerRoutes';
import salesRoutes from './routes/salesRoutes';
import sanctionRoutes from './routes/sanctionRoutes';
import disbursementRoutes from './routes/disbursementRoutes';
import collectionRoutes from './routes/collectionRoutes';
import adminRoutes from './routes/adminRoutes';

import fs from 'fs';

dotenv.config();
const app = express();

const uploadDir = path.join(__dirname, '../uploads/slips');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sanction', sanctionRoutes);
app.use('/api/disbursement', disbursementRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 LMS Backend Server running on http://localhost:${PORT}`);
  });
});
