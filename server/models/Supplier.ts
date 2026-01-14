import mongoose, { Document, Model, Schema } from 'mongoose';
import { ISupplier as ISharedSupplier } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface ISupplier extends Omit<ISharedSupplier, '_id'>, SoftDeleteDocument {}

const supplierSchema: Schema<ISupplier> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  paymentTerms: {
    type: String, // e.g., "Net 30", "Immediate", "Cash on Delivery"
  },
}, {
  timestamps: true,
});

supplierSchema.plugin(softDeletePlugin);

export default mongoose.model<ISupplier>('Supplier', supplierSchema);
