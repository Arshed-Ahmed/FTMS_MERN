import api from './api';
import { IUser } from '@shared/types';

export const authService = {
  login: async (credentials: any) => {
    const { data } = await api.post('/api/users/auth', credentials);
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/api/users/logout');
    return data;
  },

  register: async (userData: any) => {
    const { data } = await api.post('/api/users', userData);
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
};
