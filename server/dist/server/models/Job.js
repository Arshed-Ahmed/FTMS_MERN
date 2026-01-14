import mongoose from 'mongoose';
import softDeletePlugin from './plugins/softDelete.js';
const jobSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    assignedDate: {
        type: Date,
        default: Date.now,
    },
    deadline: {
        type: Date,
        required: true,
    },
    details: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
        default: 'Pending',
    },
}, {
    timestamps: true,
});
jobSchema.plugin(softDeletePlugin);
export default mongoose.model('Job', jobSchema);
