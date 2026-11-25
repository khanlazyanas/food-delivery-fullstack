import express from 'express';
import {
  getTables, createTable,
  createBooking, getBookings, updateBookingStatus
} from '../controllers/bookingController';

const router = express.Router();

// Table Routes
router.route('/tables')
  .get(getTables)
  .post(createTable);

// Booking Routes
router.route('/')
  .get(getBookings)
  .post(createBooking);

router.route('/:id/status')
  .put(updateBookingStatus);

export default router;