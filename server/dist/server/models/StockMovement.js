import mongoose from 'mongoose';
const stockMovementSchema = new mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true,
    },
    type: {
        type: String,
        enum: ['IN', 'OUT', 'ADJUSTMENT'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    reference: {
        type: String, // Can be Order ID or just a note
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
export default mongoose.model('StockMovement', stockMovementSchema);
