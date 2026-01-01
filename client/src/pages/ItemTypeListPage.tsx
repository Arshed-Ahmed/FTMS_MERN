import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, Ruler } from 'lucide-react';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useItemTypes } from '../hooks/useQueries';
import { useDeleteItemType } from '../hooks/useMutations';

const ItemTypeListPage = () => {
  const { data: itemTypes, isLoading: loading } = useItemTypes();
  const deleteItemTypeMutation = useDeleteItemType();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemTypeToDelete, setItemTypeToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setItemTypeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemTypeToDelete) return;

    deleteItemTypeMutation.mutate(itemTypeToDelete, {
      onSuccess: () => {
        toast.success('Item Type deleted successfully');
        setIsDeleteModalOpen(false);
        setItemTypeToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting item type');
      }
    });
  };

  const safeItemTypes = itemTypes || [];
  const filteredItemTypes = safeItemTypes.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Measurement Templates">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
        </div>
        <Link
          to="/itemtypes/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Template
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItemTypes.length === 0 ? (
        <EmptyState
          icon={Ruler}
          title="No templates found"
          description={searchTerm ? `No templates match "${searchTerm}"` : "Get started by creating a new measurement template."}
          actionLabel="New Template"
          onAction={() => window.location.href = '/itemtypes/add'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItemTypes.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300 mr-3">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/itemtypes/${item._id}/edit`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(item._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Measurement Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {item.fields.map((field, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredItemTypes.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">No templates found</div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="Are you sure you want to delete this measurement template? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default ItemTypeListPage;
