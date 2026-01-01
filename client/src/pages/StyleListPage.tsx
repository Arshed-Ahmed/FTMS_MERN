import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, Scissors, Layers, Tag } from 'lucide-react';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_URL } from '../constants';
import { useStyles } from '../hooks/useQueries';
import { useDeleteStyle } from '../hooks/useMutations';
import { Style } from '../types';

const StyleListPage = () => {
  const { data: styles, isLoading: loading } = useStyles();
  const deleteStyleMutation = useDeleteStyle();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setStyleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!styleToDelete) return;

    deleteStyleMutation.mutate(styleToDelete, {
      onSuccess: () => {
        toast.success('Style deleted successfully');
        setIsDeleteModalOpen(false);
        setStyleToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting style');
      }
    });
  };

  const stats = {
    total: styles ? styles.length : 0,
    categories: styles ? new Set(styles.map(s => s.category)).size : 0,
  };

  const filteredStyles = styles ? styles.filter((style) =>
    style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    style.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Layout title="Styles">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Styles</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Scissors className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search styles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
        </div>
        <Link
          to="/styles/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Style
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
              <Skeleton variant="rect" height="12rem" />
              <div className="p-4 space-y-2">
                <Skeleton width="60%" height="1.5rem" />
                <Skeleton width="90%" />
                <div className="flex justify-end space-x-2 mt-4">
                  <Skeleton variant="circle" width="2rem" height="2rem" />
                  <Skeleton variant="circle" width="2rem" height="2rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredStyles.length === 0 ? (
        <EmptyState
          title="No styles found"
          description={searchTerm ? "No styles match your search." : "Get started by adding a new style."}
          icon={Scissors}
          actionLabel={!searchTerm ? "Add Style" : undefined}
          actionLink={!searchTerm ? "/styles/add" : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStyles.map((style) => (
            <div key={style._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
              <img
                src={`${API_URL}${style.image}`}
                alt={style.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{style.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{style.description}</p>
                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    to={`/styles/${style._id}/edit`}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(style._id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Style"
        message="Are you sure you want to delete this style? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default StyleListPage;
