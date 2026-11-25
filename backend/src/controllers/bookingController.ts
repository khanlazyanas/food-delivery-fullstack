import { Request, Response } from 'express';
import Table from '../models/Table';
import Booking from '../models/Booking';

// ================= TABLES =================
export const getTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = await Table.find({});
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req: Request, res: Response): Promise<void> => {
  try {
    const { number, capacity, section } = req.body;
    const table = await Table.create({ number, capacity, section });
    res.status(201).json(table);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ================= BOOKINGS =================
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { table, customer, date, time, guests, estimatedBill, advancePaid, paymentMethod } = req.body;
    
    const booking = new Booking({
      table, customer, date, time, guests, estimatedBill, advancePaid, paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      status: 'confirmed' // Demo ke liye direct confirmed
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Populate se table ki details bhi sath aayengi
    const bookings = await Booking.find({}).populate('table').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = status;
      if (status === 'cancelled' && booking.paymentStatus === 'paid') {
        booking.paymentStatus = 'refunded';
      }
      const updated = await booking.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};