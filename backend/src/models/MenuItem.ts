import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  isVeg: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  rating: number;
}

const menuItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    isVeg: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
export default MenuItem;