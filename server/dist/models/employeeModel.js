import mongoose from 'mongoose';
const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    nic: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    display: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
