import mongoose, { Document, Model, Schema } from 'mongoose';
import { ICompany as ISharedCompany } from '../../shared/types.js';

export interface ICompany extends Omit<ISharedCompany, '_id'>, Document {}

const companySchema: Schema<ICompany> = new mongoose.Schema({
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

const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);

export default Company;
