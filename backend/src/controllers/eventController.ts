import { Request, Response } from 'express';
import Event from '../models/Event';
import Ticket from '../models/Ticket';

// ================= EVENTS =================
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = new Event(req.body);
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ================= TICKETS =================
export const bookTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, customer, chairNumbers, totalPrice, advancePaid, paymentMethod } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Check karo ki chairs pehle se booked toh nahi hain
    const existingTickets = await Ticket.find({ event: eventId, status: { $ne: 'cancelled' } });
    let bookedChairs: number[] = [];
    existingTickets.forEach(t => bookedChairs.push(...t.chairNumbers));

    const isAlreadyBooked = chairNumbers.some((chair: number) => bookedChairs.includes(chair));
    if (isAlreadyBooked) {
      res.status(400).json({ message: 'Some chairs are already booked!' });
      return;
    }

    const ticket = new Ticket({
      event: eventId,
      eventName: event.name,
      eventDate: event.date,
      eventVenue: event.venue,
      customer,
      chairNumbers,
      totalPrice,
      advancePaid,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
    });

    const createdTicket = await ticket.save();
    res.status(201).json(createdTicket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find({}).populate('event', 'name date time').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkInTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (ticket) {
      ticket.status = 'checked-in';
      const updated = await ticket.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};