import api from './api';
import { IStyle } from '@shared/types';

export const styleService = {
  getAll: async () => {
    const { data } = await api.get<IStyle[]>('/api/styles');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IStyle>(`/api/styles/${id}`);
    return data;
  },

  create: async (styleData: Partial<IStyle>) => {
    const { data } = await api.post<IStyle>('/api/styles', styleData);
    return data;
  },

  update: async (id: string, styleData: Partial<IStyle>) => {
    const { data } = await api.put<IStyle>(`/api/styles/${id}`, styleData);
    return data;
  },

  uploadImage: async (formData: FormData) => {
    const { data } = await api.post<string>('/api/styles/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/styles/${id}`);
  },
};
