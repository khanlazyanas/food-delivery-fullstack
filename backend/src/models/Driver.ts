import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  rating: number;
  isAvailable: boolean;
}

const driverSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Driver = mongoose.model<IDriver>('Driver', driverSchema);
export default Driver;