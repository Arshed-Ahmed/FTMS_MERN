import api from './api';
import { IOrder } from '@shared/types';

export const orderService = {
  getAll: async (params?: any) => {
    const { data } = await api.get<IOrder[]>('/api/orders', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IOrder>(`/api/orders/${id}`);
    return data;
  },

  create: async (orderData: Partial<IOrder>) => {
    const { data } = await api.post<IOrder>('/api/orders', orderData);
    return data;
  },

  update: async (id: string, orderData: Partial<IOrder>) => {
    const { data } = await api.put<IOrder>(`/api/orders/${id}`, orderData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/api/orders/${id}`);
    return data;
  },

  trackOrder: async (orderId: string) => {
    const { data } = await api.get<IOrder>(`/api/orders/track/${orderId}`);
    return data;
  },
};
