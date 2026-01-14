import mongoose from 'mongoose';
const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'My Company'
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    regNo: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    budget: {
        type: Number,
        default: 0
    },
    targetEmployees: {
        type: Number,
        default: 0
    },
    targetOrders: {
        type: Number,
        default: 0
    },
    logo: {
        type: String, // URL or path to logo
        default: ''
    }
}, {
    timestamps: true
});
const Company = mongoose.model('Company', companySchema);
export default Company;
