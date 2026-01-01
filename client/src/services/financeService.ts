import api from './api';
import { ITransaction } from '@shared/types';

export const financeService = {
  getSummary: async () => {
    const { data } = await api.get('/api/finance/summary');
    return data;
  },

  getTransactions: async () => {
    const { data } = await api.get<ITransaction[]>('/api/finance/transactions');
    return data;
  },

  createTransaction: async (transactionData: Partial<ITransaction>) => {
    const { data } = await api.post<ITransaction>('/api/finance/transactions', transactionData);
    return data;
  },

  deleteTransaction: async (id: string) => {
    const { data } = await api.delete(`/api/finance/transactions/${id}`);
    return data;
  },
};
