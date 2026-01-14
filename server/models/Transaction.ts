import mongoose, { Document, Model, Schema } from 'mongoose';
import { ITransaction as ISharedTransaction } from '../../shared/types.js';
import { softDeletePlugin, SoftDeleteModel, SoftDeleteDocument } from './plugins/softDelete.js';

export interface ITransaction extends Omit<ISharedTransaction, '_id' | 'recordedBy'>, SoftDeleteDocument {
  recordedBy: mongoose.Types.ObjectId;
}

const transactionSchema: Schema<ITransaction> = new mongoose.Schema({
  type: {
    type: String,
    enum: ['INCOME', 'EXPENSE'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    // Examples: 'Sales', 'Procurement', 'Rent', 'Utilities', 'Salary', 'Other'
  },
  amount: {
    type: Number,
    required: true,
  },
  reference: {
    type: String, // Order ID, PO ID, or Invoice #
  },
  description: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Check', 'Other'],
    default: 'Cash',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

transactionSchema.plugin(softDeletePlugin);

const Transaction = mongoose.model<ITransaction, SoftDeleteModel<ITransaction>>('Transaction', transactionSchema);

export default Transaction;
