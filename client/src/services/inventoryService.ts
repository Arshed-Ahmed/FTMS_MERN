import api from './api';
import { IMaterial, ISupplier, IPurchaseOrder, IItemType } from '@shared/types';

export const inventoryService = {
  // Materials
  getMaterials: async () => {
    const { data } = await api.get<IMaterial[]>('/api/materials');
    return data;
  },
  getMaterialById: async (id: string) => {
    const { data } = await api.get<IMaterial>(`/api/materials/${id}`);
    return data;
  },
  createMaterial: async (data: Partial<IMaterial>) => {
    const { data: res } = await api.post<IMaterial>('/api/materials', data);
    return res;
  },
  updateMaterial: async (id: string, data: Partial<IMaterial>) => {
    const { data: res } = await api.put<IMaterial>(`/api/materials/${id}`, data);
    return res;
  },
  deleteMaterial: async (id: string) => {
    await api.delete(`/api/materials/${id}`);
  },

  // Suppliers
  getSuppliers: async () => {
    const { data } = await api.get<ISupplier[]>('/api/suppliers');
    return data;
  },
  getSupplierById: async (id: string) => {
    const { data } = await api.get<ISupplier>(`/api/suppliers/${id}`);
    return data;
  },
  createSupplier: async (data: Partial<ISupplier>) => {
    const { data: res } = await api.post<ISupplier>('/api/suppliers', data);
    return res;
  },
  updateSupplier: async (id: string, data: Partial<ISupplier>) => {
    const { data: res } = await api.put<ISupplier>(`/api/suppliers/${id}`, data);
    return res;
  },
  deleteSupplier: async (id: string) => {
    await api.delete(`/api/suppliers/${id}`);
  },

  // Purchase Orders
  getPurchaseOrders: async () => {
    const { data } = await api.get<IPurchaseOrder[]>('/api/purchase-orders');
    return data;
  },
  getPurchaseOrderById: async (id: string) => {
    const { data } = await api.get<IPurchaseOrder>(`/api/purchase-orders/${id}`);
    return data;
  },
  createPurchaseOrder: async (data: Partial<IPurchaseOrder>) => {
    const { data: res } = await api.post<IPurchaseOrder>('/api/purchase-orders', data);
    return res;
  },
  updatePurchaseOrderStatus: async (id: string, status: string) => {
    const { data } = await api.put<IPurchaseOrder>(`/api/purchase-orders/${id}/status`, { status });
    return data;
  },
  payPurchaseOrder: async (id: string, paymentMethod: string) => {
    const { data } = await api.put<IPurchaseOrder>(`/api/purchase-orders/${id}/pay`, { paymentMethod });
    return data;
  },
  receivePurchaseOrderItems: async (id: string, items: { itemId: string; receivedQuantity: number }[]) => {
    const { data } = await api.post(`/api/purchase-orders/${id}/receive`, { items });
    return data;
  },
  deletePurchaseOrder: async (id: string) => {
    await api.delete(`/api/purchase-orders/${id}`);
  },

  // Item Types
  getItemTypes: async () => {
    const { data } = await api.get<IItemType[]>('/api/itemtypes');
    return data;
  },
  getItemTypeById: async (id: string) => {
    const { data } = await api.get<IItemType>(`/api/itemtypes/${id}`);
    return data;
  },
  createItemType: async (data: Partial<IItemType>) => {
    const { data: res } = await api.post<IItemType>('/api/itemtypes', data);
    return res;
  },
  updateItemType: async (id: string, data: Partial<IItemType>) => {
    const { data: res } = await api.put<IItemType>(`/api/itemtypes/${id}`, data);
    return res;
  },
  deleteItemType: async (id: string) => {
    await api.delete(`/api/itemtypes/${id}`);
  },
  uploadItemTypeImage: async (formData: FormData) => {
    const { data } = await api.post<string>('/api/itemtypes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
