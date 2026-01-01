import api from './api';
import { IJob } from '@shared/types';

export const jobService = {
  getAll: async () => {
    const { data } = await api.get<IJob[]>('/api/jobs');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IJob>(`/api/jobs/${id}`);
    return data;
  },

  create: async (jobData: Partial<IJob>) => {
    const { data } = await api.post<IJob>('/api/jobs', jobData);
    return data;
  },

  update: async (id: string, jobData: Partial<IJob>) => {
    const { data } = await api.put<IJob>(`/api/jobs/${id}`, jobData);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.put<IJob>(`/api/jobs/${id}/status`, { status });
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/jobs/${id}`);
  },
};
