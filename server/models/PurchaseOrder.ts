import mongoose, { Document, Model, Schema } from 'mongoose';
import { IPurchaseOrder as ISharedPurchaseOrder, IPurchaseOrderItem as ISharedPurchaseOrderItem } from '../../shared/types.js';
import { softDeletePlugin, SoftDeleteModel, SoftDeleteDocument } from './plugins/softDelete.js';

export interface IPurchaseOrderItem extends Omit<ISharedPurchaseOrderItem, 'material'> {
  material: mongoose.Types.ObjectId;
}

export interface IPurchaseOrder extends Omit<ISharedPurchaseOrder, '_id' | 'supplier' | 'items' | 'createdBy'>, SoftDeleteDocument {
  supplier: mongoose.Types.ObjectId;
  items: IPurchaseOrderItem[];
  createdBy: mongoose.Types.ObjectId;
}

const purchaseOrderSchema: Schema<IPurchaseOrder> = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  items: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unitCost: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Ordered', 'Received', 'Cancelled'],
    default: 'Draft',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  expectedDate: {
    type: Date,
  },
  receivedDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

purchaseOrderSchema.plugin(softDeletePlugin);

const PurchaseOrder = mongoose.model<IPurchaseOrder, SoftDeleteModel<IPurchaseOrder>>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
