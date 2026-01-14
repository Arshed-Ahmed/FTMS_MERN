import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/softDelete.js';
const notificationSchema = new mongoose.Schema({
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
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
