import mongoose, { Document, Model, Schema } from 'mongoose';
import { IJob as ISharedJob } from '../../shared/types.js';
import softDeletePlugin, { SoftDeleteDocument } from './plugins/softDelete.js';

export interface IJob extends Omit<ISharedJob, '_id' | 'order' | 'employee'>, SoftDeleteDocument {
  order: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
}

const jobSchema: Schema<IJob> = new mongoose.Schema({
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

export default mongoose.model<IJob>('Job', jobSchema);
