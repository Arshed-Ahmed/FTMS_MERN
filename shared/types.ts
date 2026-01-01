export interface IUser {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Tailor' | 'Sales';
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICustomer {
  _id: string;
  firstName: string;
  lastName: string;
  nic: string;
  phone: string;
  email: string;
  address: string;
  display: number;
  measurementHistory: IMeasurementHistory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IMeasurementHistory {
  date: Date;
  orderId?: string;
  measurements?: Record<string, string>;
  notes?: string;
}

export interface IMaterial {
  _id: string;
  name: string;
  type: 'Fabric' | 'Button' | 'Thread' | 'Zipper' | 'Lining' | 'Other';
  color?: string;
  quantity: number;
  unit: 'Meters' | 'Yards' | 'Pieces' | 'Spools' | 'Box';
  costPerUnit: number;
  supplier?: string;
  lowStockThreshold: number;
  description?: string;
  sku?: string;
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStyle {
  _id: string;
  name: string;
  category: string;
  image?: string;
  basePrice: number;
  description?: string;
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrder {
  _id: string;
  customer: ICustomer | string;
  style: IStyle | string;
  orderDate: Date;
  fitOnDate?: Date;
  deliveryDate: Date;
  price: number;
  discount: number;
  description?: string;
  status: 'Draft' | 'Pending' | 'Measured' | 'Cutting' | 'Stitching' | 'Trial' | 'Ready' | 'Delivered' | 'In Progress' | 'Cancelled';
  measurementSnapshot?: Record<string, string>;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod?: string;
  transactionId?: string;
  materialsUsed: {
    material: IMaterial | string;
    quantity: number;
  }[];
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IJob {
  _id: string;
  order: IOrder | string;
  employee: string; // Employee ID
  assignedDate: Date;
  deadline: Date;
  details?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold';
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  nic: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  startDate: Date;
  salary: number;
  status: string;
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISupplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentTerms?: string;
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMeasurement {
  _id: string;
  customer: ICustomer | string;
  item: string;
  values: Record<string, string>;
  notes?: string;
  moreDetails?: string;
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICompany {
  _id: string;
  name: string;
  address: string;
  city: string;
  regNo: string;
  phone: string;
  email: string;
  website: string;
  budget: number;
  targetEmployees: number;
  targetOrders: number;
  logo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IItemType {
  _id: string;
  name: string;
  fields: string[];
  image?: string;
  display: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface INotification {
  _id: string;
  recipient: IUser | string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order_update' | 'inventory_alert';
  read: boolean;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPurchaseOrderItem {
  material: IMaterial | string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchaseOrder {
  _id: string;
  supplier: ISupplier | string;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid';
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: IUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStockMovement {
  _id: string;
  material: IMaterial | string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy?: IUser | string;
  date: Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITransaction {
  _id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  reference?: string;
  description?: string;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Check' | 'Other';
  date: Date;
  recordedBy: IUser | string;
  createdAt?: string;
  updatedAt?: string;
}

