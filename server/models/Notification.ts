import mongoose, { Document, Model, Schema } from 'mongoose';
import { INotification as ISharedNotification } from '../../shared/types.js';
import { softDeletePlugin, SoftDeleteModel, SoftDeleteDocument } from './plugins/softDelete.js';

export interface INotification extends Omit<ISharedNotification, '_id' | 'recipient'>, SoftDeleteDocument {
  recipient: mongoose.Types.ObjectId;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'order_update', 'inventory_alert'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
}, {
  timestamps: true,
});

notificationSchema.plugin(softDeletePlugin);

const Notification = mongoose.model<INotification, SoftDeleteModel<INotification>>('Notification', notificationSchema);

export default Notification;