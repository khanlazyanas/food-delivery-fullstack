import mongoose, { Document, Schema } from 'mongoose';

export interface ICelebration extends Document {
  occasion: 'birthday' | 'anniversary' | 'other';
  celebrantName: string;
  celebrantPhoto?: string;
  packageId: string;
  packageName: string;
  date: string;
  time: string;
  guests: number;
  specialMessage: string;
  specialRequests?: string;
  totalPrice: number;
  advancePaid: number;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  preparationStatus: 'pending' | 'decorating' | 'preparing' | 'ready';
  cardStatus: 'pending' | 'designing' | 'printed' | 'delivered';
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
}

const celebrationSchema: Schema = new Schema({
  occasion: { type: String, enum: ['birthday', 'anniversary', 'other'], required: true },
  celebrantName: { type: String, required: true },
  celebrantPhoto: { type: String },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  specialMessage: { type: String, required: true },
  specialRequests: { type: String },
  totalPrice: { type: Number, required: true },
  advancePaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  preparationStatus: { type: String, enum: ['pending', 'decorating', 'preparing', 'ready'], default: 'pending' },
  cardStatus: { type: String, enum: ['pending', 'designing', 'printed', 'delivered'], default: 'pending' },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
}, { timestamps: true });

const Celebration = mongoose.model<ICelebration>('Celebration', celebrationSchema);
export default Celebration;