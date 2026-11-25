import express from 'express';
import {
  getEvents, createEvent,
  bookTicket, getTickets, checkInTicket
} from '../controllers/eventController';

const router = express.Router();

// Events
router.route('/')
  .get(getEvents)
  .post(createEvent);

// Tickets
router.route('/tickets')
  .get(getTickets)
  .post(bookTicket);

router.route('/tickets/:id/checkin')
  .put(checkInTicket);

export default router;