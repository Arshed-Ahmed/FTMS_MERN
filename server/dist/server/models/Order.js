import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    style: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Style',
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    fitOnDate: {
        type: Date,
    },
    deliveryDate: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Measured', 'Cutting', 'Stitching', 'Trial', 'Ready', 'Delivered', 'In Progress'],
        default: 'Pending',
    },
    measurementSnapshot: {
        type: Map,
        of: String,
        default: {}
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    materialsUsed: [{
            material: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Material',
            },
            quantity: {
                type: Number,
                required: true,
            },
        }],
}, {
    timestamps: true,
});
orderSchema.plugin(softDeletePlugin);
export default mongoose.model('Order', orderSchema);
