import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, FileText, ShoppingBag, Clock, Activity, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
// import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants';
import { useOrders } from '../hooks/useQueries';
import { useDeleteOrder } from '../hooks/useMutations';
import { IOrder } from '@shared/types';

const OrderListPage = () => {
  // const { userInfo: user } = useAuth();
  const { data: ordersData, isLoading: loading } = useOrders();
  const orders = ordersData || [];
  const deleteOrderMutation = useDeleteOrder();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrderMutation.mutateAsync(orderToDelete);
      toast.success('Order deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting order');
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const stats = {
    total: orders ? orders.length : 0,
    pending: orders ? orders.filter(o => o.status === 'Pending').length : 0,
    inProgress: orders ? orders.filter(o => o.status === 'In Progress').length : 0,
    revenue: orders ? orders.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) : 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Ready': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer.name',
      sortable: true,
      render: (order: IOrder) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer?.firstName} {order.customer?.lastName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.phone}</div>
        </div>
      )
    },
    {
      header: 'Style',
      accessor: 'style.name',
      sortable: true,
      render: (order: IOrder) => (
        <div className="flex items-center">
          {order.style?.image && (
            <img className="h-8 w-8 rounded-full object-cover mr-2" src={`${API_URL}${order.style.image}`} alt="" />
          )}
          <div className="text-sm text-gray-900 dark:text-white">{order.style?.name || 'Unknown'}</div>
        </div>
      )
    },
    {
      header: 'Delivery Date',
      accessor: 'deliveryDate',
      sortable: true,
      render: (order: IOrder) => new Date(order.deliveryDate).toLocaleDateString()
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: true,
      render: (order: IOrder) => `$${order.price}`
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (order: Order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      )
    }
  ];

  columns.push({
    header: 'Actions',
    accessor: 'actions',
    align: 'right',
    render: (order: Order) => (
      <div className="flex justify-end items-center">
        <Link to={`/orders/${order._id}/invoice`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mr-4" title="Invoice">
          <FileText className="w-5 h-5 inline" />
        </Link>
        <Link to={`/orders/${order._id}/edit`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4" title="Edit">
          <Edit className="w-5 h-5 inline" />
        </Link>
        <button onClick={() => handleDeleteClick(order._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete">
          <Trash2 className="w-5 h-5 inline" />
        </button>
      </div>
    )
  });

  return (
    <Layout title="Orders">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.revenue.toLocaleString()}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end items-center">
        <Link
          to="/orders/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Order
        </Link>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <Skeleton width="250px" height="40px" />
              <Skeleton width="100px" height="20px" />
            </div>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="60px" />
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Get started by creating a new order for a customer."
          icon={ShoppingBag}
          actionLabel="Create Order"
          actionLink="/orders/add"
        />
      ) : (
        <DataTable columns={columns} data={orders} searchPlaceholder="Search orders..." />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default OrderListPage;
