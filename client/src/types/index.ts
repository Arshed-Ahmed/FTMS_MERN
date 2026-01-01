export type {
  IUser as User,
  ICustomer as Customer,
  IOrder as Order,
  IMaterial as Material,
  IStyle as Style,
  IJob as Job,
  IEmployee as Employee,
  ISupplier as Supplier,
  IMeasurement as Measurement,
  IMeasurementHistory,
  ICompany as Company,
  IItemType as ItemType,
  INotification as Notification,
  IPurchaseOrder as PurchaseOrder,
  IPurchaseOrderItem as PurchaseOrderItem,
  IStockMovement as StockMovement,
  ITransaction as Transaction
} from '@shared/types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
