import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  event: mongoose.Schema.Types.ObjectId;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  chairNumbers: number[];
  totalPrice: number;
  advancePaid: number;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'confirmed' | 'cancelled' | 'checked-in';
}

const ticketSchema: Schema = new Schema({
  event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
  eventName: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventVenue: { type: String, required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  chairNumbers: [{ type: Number, required: true }],
  totalPrice: { type: Number, required: true },
  advancePaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['confirmed', 'cancelled', 'checked-in'], default: 'confirmed' },
}, { timestamps: true });

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;