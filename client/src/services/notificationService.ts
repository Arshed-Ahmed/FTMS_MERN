import api from './api';

export interface INotification {
  _id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getAll: async (limit?: number) => {
    const url = limit ? `/api/notifications?limit=${limit}` : '/api/notifications';
    const { data } = await api.get<INotification[]>(url);
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.put(`/api/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/api/notifications/read-all');
    return data;
  },
  
  delete: async (id: string) => {
      await api.delete(`/api/notifications/${id}`);
  }
};
