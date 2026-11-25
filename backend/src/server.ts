import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import bookingRoutes from './routes/bookingRoutes';
import eventRoutes from './routes/eventRoutes';
import tripRoutes from './routes/tripRoutes';


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('FoodieHub Backend API is running... 🚀');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/trips', tripRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});