import { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  Trash2, RefreshCw, User, Briefcase, ShoppingBag, Ruler, 
  Scissors, FileText, Package, Tag, Truck, CreditCard, Bell, DollarSign
} from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useTrash, useRestoreTrash, useDeleteTrash, useEmptyTrash } from '../hooks/useQueries';

const TrashPage = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isEmptyTrashModalOpen, setIsEmptyTrashModalOpen] = useState(false);

  const { data: items = [], isLoading } = useTrash();
  const restoreMutation = useRestoreTrash();
  const deleteMutation = useDeleteTrash();
  const emptyTrashMutation = useEmptyTrash();

  const handleRestore = async (id: string, type: string) => {
    try {
      await restoreMutation.mutateAsync({ id, type });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} restored successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error restoring item');
    }
  };

  const handleForceDeleteClick = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmForceDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: itemToDelete._id, type: itemToDelete.type });
      toast.success('Item permanently deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting item');
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEmptyTrashClick = () => {
    setIsEmptyTrashModalOpen(true);
  };

  const confirmEmptyTrash = async () => {
    try {
      await emptyTrashMutation.mutateAsync();
      toast.success('Trash emptied successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error emptying trash');
    } finally {
      setIsEmptyTrashModalOpen(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: any = {
      customer: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', icon: User, label: 'Customer' },
      employee: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', icon: Briefcase, label: 'Employee' },
      order: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: ShoppingBag, label: 'Order' },
      measurement: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', icon: Ruler, label: 'Measurement' },
      style: { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200', icon: Scissors, label: 'Style' },
      job: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200', icon: FileText, label: 'Job' },
      material: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', icon: Package, label: 'Material' },
      itemtype: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', icon: Tag, label: 'Template' },
      supplier: { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-200', icon: Truck, label: 'Supplier' },
      'purchase-order': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', icon: CreditCard, label: 'Purchase Order' },
      user: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', icon: User, label: 'User' },
      notification: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200', icon: Bell, label: 'Notification' },
      transaction: { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-800 dark:text-emerald-200', icon: DollarSign, label: 'Transaction' },
    };

    const style = styles[type] || styles.customer;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {style.label}
      </span>
    );
  };

  const getItemName = (item: any) => {
    switch (item.type) {
      case 'customer':
      case 'employee':
        return `${item.firstName} ${item.lastName}`;
      case 'order':
        return `Order #${item._id.slice(-6)} - ${item.customer?.firstName || 'Unknown'}`;
      case 'measurement':
        return `Measurement - ${item.customer?.firstName || 'Unknown'}`;
      case 'style':
      case 'material':
      case 'itemtype':
        return item.name;
      case 'job':
        return `Job #${item._id.slice(-6)} - ${item.employee?.firstName || 'Unassigned'}`;
      default:
        return 'Unknown Item';
    }
  };

  const getItemDetails = (item: any) => {
    switch (item.type) {
      case 'customer':
        return item.nic;
      case 'employee':
        return item.category;
      case 'order':
        return `Due: ${new Date(item.deliveryDate).toLocaleDateString()}`;
      case 'measurement':
        return item.item || 'N/A';
      case 'style':
        return item.category;
      case 'job':
        return item.status;
      case 'material':
        return `${item.quantity} ${item.unit}`;
      case 'itemtype':
        return `${item.fields?.length || 0} fields`;
      default:
        return '';
    }
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'type',
      render: (item: any) => getTypeBadge(item.type)
    },
    {
      header: 'Description',
      accessor: 'name',
      render: (item: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {getItemName(item)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getItemDetails(item)}
          </div>
        </div>
      )
    },
    {
      header: 'Deleted At',
      accessor: 'updatedAt',
      render: (item: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(item.updatedAt).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (item: any) => (
        <div className="flex justify-end items-center space-x-2">
          <button 
            onClick={() => handleRestore(item._id, item.type)}
            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            title="Restore"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleForceDeleteClick(item)}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete Permanently"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Trash">
      <div className="flex justify-end mb-4">
        {items.length > 0 && (
          <button
            onClick={handleEmptyTrashClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Empty Trash
          </button>
        )}
      </div>

      {isLoading ? (
        <Skeleton count={5} />
      ) : (
        items.length > 0 ? (
          <DataTable columns={columns} data={items} />
        ) : (
          <EmptyState
            title="Trash is empty"
            description="No deleted items found."
            icon={Trash2}
          />
        )
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmForceDelete}
        title="Permanently Delete Item"
        message={`Are you sure you want to permanently delete this ${itemToDelete?.type}? This action cannot be undone.`}
        confirmText="Delete Permanently"
        isDangerous={true}
      />

      <ConfirmationModal
        isOpen={isEmptyTrashModalOpen}
        onClose={() => setIsEmptyTrashModalOpen(false)}
        onConfirm={confirmEmptyTrash}
        title="Empty Trash"
        message="Are you sure you want to permanently delete all items in the trash? This action cannot be undone."
        confirmText="Empty Trash"
        isDangerous={true}
      />
    </Layout>
  );
};

export default TrashPage;
