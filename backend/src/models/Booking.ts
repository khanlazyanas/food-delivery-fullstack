import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  table: mongoose.Schema.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    email?: string;
    specialRequests?: string;
  };
  date: string;
  time: string;
  guests: number;
  estimatedBill: number;
  advancePaid: number;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
}

const bookingSchema: Schema = new Schema({
  table: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Table' },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    specialRequests: { type: String },
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  estimatedBill: { type: Number, required: true },
  advancePaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'], default: 'pending' },
}, { timestamps: true });

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;