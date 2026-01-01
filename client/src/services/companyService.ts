import api from './api';

export interface ICompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  currency: string;
  taxRate: number;
}

export const companyService = {
  getSettings: async () => {
    const { data } = await api.get<ICompanySettings>('/api/company');
    return data;
  },

  updateSettings: async (settings: FormData | Partial<ICompanySettings>) => {
    const headers = settings instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const { data } = await api.put<ICompanySettings>('/api/company', settings, { headers });
    return data;
  },
};
