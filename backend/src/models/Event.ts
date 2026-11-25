import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  banner: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  rules: string;
  ticketPrice: number;
  totalChairs: number;
  isActive: boolean;
}

const eventSchema: Schema = new Schema({
  name: { type: String, required: true },
  banner: { type: String, required: true },
  artist: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  description: { type: String, required: true },
  rules: { type: String },
  ticketPrice: { type: Number, required: true },
  totalChairs: { type: Number, required: true, default: 50 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;