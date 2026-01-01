import api from './api';
import { ICustomer } from '@shared/types';

export const customerService = {
  getAll: async () => {
    const { data } = await api.get<ICustomer[]>('/api/customers');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ICustomer>(`/api/customers/${id}`);
    return data;
  },

  create: async (customerData: Partial<ICustomer>) => {
    const { data } = await api.post<ICustomer>('/api/customers', customerData);
    return data;
  },

  update: async (id: string, customerData: Partial<ICustomer>) => {
    const { data } = await api.put<ICustomer>(`/api/customers/${id}`, customerData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/api/customers/${id}`);
    return data;
  },
};
