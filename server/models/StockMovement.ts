import mongoose, { Document, Model, Schema } from 'mongoose';
import { IStockMovement as ISharedStockMovement } from '../../shared/types.js';

export interface IStockMovement extends Omit<ISharedStockMovement, '_id' | 'material' | 'performedBy'>, Document {
  material: mongoose.Types.ObjectId;
  performedBy?: mongoose.Types.ObjectId;
}

const stockMovementSchema: Schema<IStockMovement> = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  reference: {
    type: String, // Can be Order ID or just a note
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
