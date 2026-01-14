import mongoose, { Document, Model, Schema } from 'mongoose';
import { IMaterial as ISharedMaterial } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface IMaterial extends Omit<ISharedMaterial, '_id'>, SoftDeleteDocument {}

const materialSchema: Schema<IMaterial> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Fabric', 'Button', 'Thread', 'Zipper', 'Lining', 'Other'],
    },
    color: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['Meters', 'Yards', 'Pieces', 'Spools', 'Box'],
    },
    costPerUnit: {
      type: Number,
      required: true,
      default: 0,
    },
    supplier: {
      type: String,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    description: {
      type: String,
    },
    sku: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

materialSchema.plugin(softDeletePlugin);

const Material: Model<IMaterial> = mongoose.model<IMaterial>('Material', materialSchema);

export default Material;
