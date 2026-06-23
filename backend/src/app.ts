import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', reviewRoutes);

app.use(errorHandler);

export default app;
