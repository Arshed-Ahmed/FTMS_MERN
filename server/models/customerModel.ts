import mongoose, { Document, Model, Schema } from 'mongoose';
import { ICustomer as ISharedCustomer, IMeasurementHistory as ISharedMeasurementHistory } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface IMeasurementHistory extends Omit<ISharedMeasurementHistory, 'orderId'> {
  orderId?: mongoose.Types.ObjectId;
}

export interface ICustomer extends Omit<ISharedCustomer, '_id' | 'measurementHistory'>, SoftDeleteDocument {
  measurementHistory: IMeasurementHistory[];
}

const customerSchema: Schema<ICustomer> = new mongoose.Schema({
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
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  measurementHistory: [{
    date: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    measurements: {
      type: Map,
      of: String,
    },
    notes: String,
  }],
}, {
  timestamps: true,
});

customerSchema.plugin(softDeletePlugin);

const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
