import mongoose from 'mongoose';
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
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending',
    },
    display: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
export default mongoose.model('Job', jobSchema);
