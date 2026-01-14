import mongoose, { Document, Model, Schema } from 'mongoose';
import { IItemType as ISharedItemType } from '../../shared/types.js';
import { softDeletePlugin, SoftDeleteModel, SoftDeleteDocument } from './plugins/softDelete.js';

export interface IItemType extends Omit<ISharedItemType, '_id'>, SoftDeleteDocument {}

const itemTypeSchema: Schema<IItemType> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  fields: [{
    type: String,
    required: true
  }],
  image: {
    type: String,
    required: false
  },
}, {
  timestamps: true,
});

itemTypeSchema.plugin(softDeletePlugin);

const ItemType = mongoose.model<IItemType, SoftDeleteModel<IItemType>>('ItemType', itemTypeSchema);

export default ItemType;
