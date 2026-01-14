import mongoose from 'mongoose';
const itemTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    fields: [{
            type: String,
            required: true
        }],
    image: {
        type: String,
        required: false
    },
    display: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const ItemType = mongoose.model('ItemType', itemTypeSchema);
export default ItemType;
