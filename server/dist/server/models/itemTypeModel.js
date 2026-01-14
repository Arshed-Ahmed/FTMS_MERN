import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins/softDelete.js';
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
}, {
    timestamps: true,
});
itemTypeSchema.plugin(softDeletePlugin);
const ItemType = mongoose.model('ItemType', itemTypeSchema);
export default ItemType;
