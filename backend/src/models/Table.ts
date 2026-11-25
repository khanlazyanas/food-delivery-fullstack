import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  number: string;
  capacity: number;
  section: 'Indoor' | 'Outdoor' | 'Private' | 'Rooftop';
  isActive: boolean;
}

const tableSchema: Schema = new Schema({
  number: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  section: { 
    type: String, 
    enum: ['Indoor', 'Outdoor', 'Private', 'Rooftop'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Table = mongoose.model<ITable>('Table', tableSchema);
export default Table;