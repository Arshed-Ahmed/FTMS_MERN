import mongoose from 'mongoose';
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
    display: {
        type: Number,
        default: 0,
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
const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
