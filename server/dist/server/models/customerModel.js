import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    nic: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    measurementHistory: [{
            date: {
                type: Date,
                default: Date.now,
            },
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order',
            },
            measurements: {
                type: Map,
                of: String,
            },
            notes: String,
        }],
}, {
    timestamps: true,
});
customerSchema.plugin(softDeletePlugin);
const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
