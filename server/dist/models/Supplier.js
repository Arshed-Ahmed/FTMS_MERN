import mongoose from 'mongoose';
const supplierSchema = new mongoose.Schema({
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
    display: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
export default mongoose.model('Supplier', supplierSchema);
