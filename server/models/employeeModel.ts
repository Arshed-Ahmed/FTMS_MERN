import mongoose, { Document, Model, Schema } from 'mongoose';
import { IEmployee as ISharedEmployee } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface IEmployee extends Omit<ISharedEmployee, '_id'>, SoftDeleteDocument {}

const employeeSchema: Schema<IEmployee> = new mongoose.Schema({
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
}, {
  timestamps: true,
});

employeeSchema.plugin(softDeletePlugin);

const Employee: Model<IEmployee> = mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee;
