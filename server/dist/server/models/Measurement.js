import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
const measurementSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    item: {
        type: String,
        required: true,
        // e.g., 'Shirt', 'Trousers', 'Suit'
    },
    values: {
        type: Map,
        of: String,
        // Flexible key-value pairs for measurements
        // e.g., { "Neck": "16", "Chest": "40", "Sleeve": "24" }
        // Or we can just store a string if we want to mimic the PHP simple string
        default: {}
    },
    // Keeping a raw string field too just in case they want free text
    notes: {
        type: String,
    },
    moreDetails: {
        type: String,
    },
}, {
    timestamps: true,
});
measurementSchema.plugin(softDeletePlugin);
export default mongoose.model('Measurement', measurementSchema);
