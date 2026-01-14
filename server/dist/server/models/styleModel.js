import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
const styleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    basePrice: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        enum: ['Shirt', 'Trouser', 'Suit', 'Other'],
        default: 'Other'
    },
}, {
    timestamps: true,
});
styleSchema.plugin(softDeletePlugin);
const Style = mongoose.model('Style', styleSchema);
export default Style;
