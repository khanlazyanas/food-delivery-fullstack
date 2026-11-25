import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    instructions?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  orderType: 'delivery' | 'pickup';
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  status: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      instructions: { type: String },
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    orderType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    status: { type: String, default: 'placed' }, // placed, confirmed, preparing, out-for-delivery, delivered, cancelled
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;