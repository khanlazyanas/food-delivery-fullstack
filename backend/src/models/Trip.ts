import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  customer: {
    name: string;
    phone: string;
    email?: string;
    specialRequests?: string;
  };
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  returnLocation: string;
  serviceCharges: number;
  paymentMethod: 'online' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: string;
  driver?: mongoose.Schema.Types.ObjectId;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
}

const tripSchema: Schema = new Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    specialRequests: { type: String },
  },
  pickupLocation: { type: String, required: true },
  pickupDate: { type: String, required: true },
  pickupTime: { type: String, required: true },
  passengers: { type: Number, required: true },
  returnLocation: { type: String, required: true },
  serviceCharges: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  status: { type: String, default: 'requested' }, // requested, driver-assigned, picked-up, completed, cancelled
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  driverInfo: {
    name: String,
    phone: String,
    vehicleNumber: String,
  },
}, { timestamps: true });

const Trip = mongoose.model<ITrip>('Trip', tripSchema);
export default Trip;