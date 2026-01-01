import api from './api';
import { IMeasurementHistory, IMeasurement } from '@shared/types';

export const measurementService = {
  getAll: async () => {
      const { data } = await api.get<IMeasurement[]>('/api/measurements');
      return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IMeasurement>(`/api/measurements/${id}`);
    return data;
  },

  getByCustomerId: async (customerId: string) => {
    const { data } = await api.get<IMeasurementHistory[]>(`/api/measurements/customer/${customerId}`);
    return data;
  },

  create: async (measurementData: any) => {
    const { data } = await api.post<IMeasurement>('/api/measurements', measurementData);
    return data;
  },

  update: async (id: string, measurementData: any) => {
    const { data } = await api.put<IMeasurement>(`/api/measurements/${id}`, measurementData);
    return data;
  },

  save: async (customerId: string, measurementData: any) => {
    const { data } = await api.post<IMeasurementHistory>(`/api/measurements/customer/${customerId}`, measurementData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/api/measurements/${id}`);
    return data;
  }
};
