import mongoose from 'mongoose';
const styleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
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
    display: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const Style = mongoose.model('Style', styleSchema);
export default Style;
