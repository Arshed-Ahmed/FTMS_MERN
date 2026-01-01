import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, Ruler } from 'lucide-react';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAllMeasurements } from '../hooks/useQueries';
import { useDeleteMeasurement } from '../hooks/useMutations';
import { Measurement } from '../types';

const MeasurementListPage = () => {
  const { data: measurements, isLoading: loading } = useAllMeasurements();
  const deleteMeasurementMutation = useDeleteMeasurement();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setMeasurementToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!measurementToDelete) return;

    deleteMeasurementMutation.mutate(measurementToDelete, {
      onSuccess: () => {
        toast.success('Measurement deleted successfully');
        setIsDeleteModalOpen(false);
        setMeasurementToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting measurement');
      }
    });
  };

  const filteredMeasurements = measurements ? measurements.filter((m) =>
    m.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.item.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Layout title="Measurements">
      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search measurements..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
        </div>
        <Link
          to="/measurements/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Measurement
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2 w-full">
                  <Skeleton width="60%" height="1.5rem" />
                  <Skeleton width="40%" />
                </div>
                <Skeleton variant="circle" width="2.5rem" height="2.5rem" />
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton width="100%" />
                <Skeleton width="100%" />
                <Skeleton width="80%" />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Skeleton variant="circle" width="2rem" height="2rem" />
                <Skeleton variant="circle" width="2rem" height="2rem" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMeasurements.length === 0 ? (
        <EmptyState
          title="No measurements found"
          description={searchTerm ? "No measurements match your search." : "Get started by adding a new measurement."}
          icon={Ruler}
          actionLabel={!searchTerm ? "New Measurement" : undefined}
          actionLink={!searchTerm ? "/measurements/add" : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeasurements.map((m) => (
            <div key={m._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{m.customer?.name || 'Unknown Customer'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{m.item}</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300">
                  <Ruler className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {m.values && Object.entries(m.values).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>

              {m.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">"{m.notes}"</p>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                  to={`/measurements/${m._id}/edit`}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDeleteClick(m._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Measurement"
        message="Are you sure you want to delete this measurement? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default MeasurementListPage;
