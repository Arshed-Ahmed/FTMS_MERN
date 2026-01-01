import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Eye, Trash2, ShoppingCart, CheckCircle, Clock, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { usePurchaseOrders } from '../hooks/useQueries';
import { useDeletePurchaseOrder } from '../hooks/useMutations';

const PurchaseOrderListPage = () => {
  const { data: purchaseOrdersData, isLoading: loading } = usePurchaseOrders();
  const purchaseOrders = purchaseOrdersData || [];
  const deletePurchaseOrderMutation = useDeletePurchaseOrder();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setPoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!poToDelete) return;

    deletePurchaseOrderMutation.mutate(poToDelete, {
      onSuccess: () => {
        toast.success('Purchase Order deleted successfully');
        setIsDeleteModalOpen(false);
        setPoToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting purchase order');
      }
    });
  };

  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(po => po.status === 'Ordered' || po.status === 'Draft').length,
    received: purchaseOrders.filter(po => po.status === 'Received').length,
    totalAmount: purchaseOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Ordered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Received': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const columns = [
    { header: 'PO Number', accessor: 'poNumber' },
    { 
      header: 'Supplier', 
      accessor: (po) => po.supplier?.name || 'Unknown Supplier' 
    },
    { 
      header: 'Date', 
      accessor: (po) => new Date(po.orderDate).toLocaleDateString() 
    },
    { 
      header: 'Total Amount', 
      accessor: (po) => `$${po.totalAmount.toFixed(2)}` 
    },
    {
      header: 'Status',
      accessor: (po) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(po.status)}`}>
          {po.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (po) => (
        <div className="flex space-x-2">
          <Link
            to={`/purchase-orders/${po._id}/receive`}
            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            title="Receive Items"
          >
            <CheckCircle size={18} />
          </Link>
          {/* Only allow delete if Draft or Cancelled */}
          {(po.status === 'Draft' || po.status === 'Cancelled') && (
             <button
             onClick={() => handleDeleteClick(po._id)}
             className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
             title="Delete"
           >
             <Trash2 size={18} />
           </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Purchase Orders">
        <Skeleton count={5} />
      </Layout>
    );
  }

  return (
    <Layout title="Purchase Orders">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total POs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
            <p className="text-sm text-gray-500 dark:text-gray-400">Received</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.received}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spend</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalAmount.toLocaleString()}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Purchase Orders</h1>
        <Link
          to="/purchase-orders/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus size={20} className="mr-2" />
          Create PO
        </Link>
      </div>

      {purchaseOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchase orders found"
          description="Get started by creating a new purchase order."
          actionLabel="Create PO"
          actionLink="/purchase-orders/new"
        />
      ) : (
        <DataTable columns={columns} data={purchaseOrders} />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
      />
    </Layout>
  );
};

export default PurchaseOrderListPage;
