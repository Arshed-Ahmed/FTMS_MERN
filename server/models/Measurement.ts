import mongoose, { Document, Model, Schema } from 'mongoose';
import { IMeasurement as ISharedMeasurement } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface IMeasurement extends Omit<ISharedMeasurement, '_id' | 'customer'>, SoftDeleteDocument {
  customer: mongoose.Types.ObjectId;
}

const measurementSchema: Schema<IMeasurement> = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  item: {
    type: String,
    required: true,
    // e.g., 'Shirt', 'Trousers', 'Suit'
  },
  values: {
    type: Map,
    of: String,
    // Flexible key-value pairs for measurements
    // e.g., { "Neck": "16", "Chest": "40", "Sleeve": "24" }
    // Or we can just store a string if we want to mimic the PHP simple string
    default: {}
  },
  // Keeping a raw string field too just in case they want free text
  notes: {
    type: String,
  },
  moreDetails: {
    type: String,
  },
}, {
  timestamps: true,
});

measurementSchema.plugin(softDeletePlugin);

export default mongoose.model<IMeasurement>('Measurement', measurementSchema);
