import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'admin' | 'driver';
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    role: { 
      type: String, 
      enum: ['customer', 'admin', 'driver'], 
      default: 'customer' 
    },
    address: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;