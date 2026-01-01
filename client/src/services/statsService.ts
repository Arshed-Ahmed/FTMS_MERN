import api from './api';

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalEmployees: number;
  pendingOrders: number;
  revenue: number;
  lowStockCount: number;
  pendingPO: number;
  netProfit: number;
  ordersByStatus: { _id: string; count: number }[];
  recentOrders: any[]; // Replace with IOrder[] if possible, but might be populated differently
}

export const statsService = {
  getDashboardStats: async () => {
    const { data } = await api.get<DashboardStats>('/api/stats/dashboard');
    return data;
  },
};
