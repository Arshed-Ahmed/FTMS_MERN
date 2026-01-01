import api from './api';
import { IUser } from '@shared/types';

export const userService = {
  getAll: async () => {
    const { data } = await api.get<IUser[]>('/api/users');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IUser>(`/api/users/${id}`);
    return data;
  },

  create: async (userData: Partial<IUser>) => {
    const { data } = await api.post<IUser>('/api/users', userData);
    return data;
  },

  update: async (id: string, userData: Partial<IUser>) => {
    const { data } = await api.put<IUser>(`/api/users/${id}`, userData);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get<IUser>('/api/users/profile');
    return data;
  },

  updateProfile: async (userData: Partial<IUser>) => {
    const { data } = await api.put<IUser>('/api/users/profile', userData);
    return data;
  },

  uploadAvatar: async (formData: FormData) => {
    const { data } = await api.post<string>('/api/users/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
  },
};
