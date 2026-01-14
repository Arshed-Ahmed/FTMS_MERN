import mongoose from 'mongoose';
const purchaseOrderSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
    },
    items: [{
            material: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Material',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            unitCost: {
                type: Number,
                required: true,
            },
            total: {
                type: Number,
                required: true,
            }
        }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Draft', 'Ordered', 'Received', 'Cancelled'],
        default: 'Draft',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    expectedDate: {
        type: Date,
    },
    receivedDate: {
        type: Date,
    },
    notes: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
