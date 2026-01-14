import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
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
}, {
    timestamps: true,
});
supplierSchema.plugin(softDeletePlugin);
export default mongoose.model('Supplier', supplierSchema);
