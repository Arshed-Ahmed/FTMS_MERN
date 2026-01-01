import api from './api';
import { IEmployee } from '@shared/types';

export const employeeService = {
  getAll: async () => {
    const { data } = await api.get<IEmployee[]>('/api/employees');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IEmployee>(`/api/employees/${id}`);
    return data;
  },

  create: async (employeeData: Partial<IEmployee>) => {
    const { data } = await api.post<IEmployee>('/api/employees', employeeData);
    return data;
  },

  update: async (id: string, employeeData: Partial<IEmployee>) => {
    const { data } = await api.put<IEmployee>(`/api/employees/${id}`, employeeData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/api/employees/${id}`);
    return data;
  },
};
