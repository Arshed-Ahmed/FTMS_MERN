import api from './api';

export const trashService = {
  getAll: async () => {
    const endpoints = [
      { url: '/api/customers/trash', type: 'customer' },
      { url: '/api/employees/trash', type: 'employee' },
      { url: '/api/orders/trash', type: 'order' },
      { url: '/api/measurements/trash', type: 'measurement' },
      { url: '/api/styles/trash', type: 'style' },
      { url: '/api/jobs/trash', type: 'job' },
      { url: '/api/materials/trash', type: 'material' },
      { url: '/api/itemtypes/trash', type: 'itemtype' },
      { url: '/api/suppliers/trash', type: 'supplier' },
      { url: '/api/purchase-orders/trash', type: 'purchase-order' },
      { url: '/api/users/trash', type: 'user' },
      { url: '/api/notifications/trash', type: 'notification' },
      { url: '/api/finance/transactions/trash', type: 'transaction' }
    ];

    const results = await Promise.allSettled(
      endpoints.map(endpoint => api.get(endpoint.url))
    );

    const combinedItems: any[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const type = endpoints[index].type;
        const data = Array.isArray(result.value.data) ? result.value.data : [];
        const items = data.map((i: any) => ({ ...i, type }));
        combinedItems.push(...items);
      } else {
        console.error(`Failed to fetch trash for ${endpoints[index].type}:`, result.reason);
      }
    });

    return combinedItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  restore: async (id: string, type: string) => {
    const pluralMap: Record<string, string> = {
      customer: 'customers',
      employee: 'employees',
      order: 'orders',
      measurement: 'measurements',
      style: 'styles',
      job: 'jobs',
      material: 'materials',
      itemtype: 'itemtypes',
      supplier: 'suppliers',
      'purchase-order': 'purchase-orders',
      user: 'users',
      notification: 'notifications',
      transaction: 'finance/transactions'
    };
    const endpoint = `/api/${pluralMap[type]}/${id}/restore`;
    const { data } = await api.put(endpoint);
    return data;
  },

  permanentDelete: async (id: string, type: string) => {
    const pluralMap: Record<string, string> = {
      customer: 'customers',
      employee: 'employees',
      order: 'orders',
      measurement: 'measurements',
      style: 'styles',
      job: 'jobs',
      material: 'materials',
      itemtype: 'itemtypes',
      supplier: 'suppliers',
      'purchase-order': 'purchase-orders',
      user: 'users',
      notification: 'notifications',
      transaction: 'finance/transactions'
    };
    const endpoint = `/api/${pluralMap[type]}/${id}/force`;
    await api.delete(endpoint);
  },

  emptyTrash: async () => {
    await api.delete('/api/trash');
  }
};
