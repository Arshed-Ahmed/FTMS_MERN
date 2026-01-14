import mongoose, { Document, Model, Schema } from 'mongoose';
import { IStyle as ISharedStyle } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface IStyle extends Omit<ISharedStyle, '_id'>, SoftDeleteDocument {}

const styleSchema: Schema<IStyle> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: ['Shirt', 'Trouser', 'Suit', 'Other'],
    default: 'Other'
  },
}, {
  timestamps: true,
});

styleSchema.plugin(softDeletePlugin);

const Style: Model<IStyle> = mongoose.model<IStyle>('Style', styleSchema);

export default Style;
