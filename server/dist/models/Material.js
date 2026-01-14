import mongoose from 'mongoose';
const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Fabric', 'Button', 'Thread', 'Zipper', 'Lining', 'Other'],
    },
    color: {
        type: String,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    },
    unit: {
        type: String,
        required: true,
        enum: ['Meters', 'Yards', 'Pieces', 'Spools', 'Box'],
    },
    costPerUnit: {
        type: Number,
        required: true,
        default: 0,
    },
    supplier: {
        type: String,
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
    },
    description: {
        type: String,
    },
    sku: {
        type: String,
        unique: true,
    },
    display: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const Material = mongoose.model('Material', materialSchema);
export default Material;
