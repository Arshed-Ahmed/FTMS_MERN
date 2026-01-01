import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Truck, Phone, Mail } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useSuppliers } from '../hooks/useQueries';
import { useDeleteSupplier } from '../hooks/useMutations';
import { Supplier } from '../types';

const SupplierListPage = () => {
  const { data: suppliers, isLoading: loading } = useSuppliers();
  const deleteSupplierMutation = useDeleteSupplier();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSupplierToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    deleteSupplierMutation.mutate(supplierToDelete, {
      onSuccess: () => {
        toast.success('Supplier deleted successfully');
        setIsDeleteModalOpen(false);
        setSupplierToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting supplier');
      }
    });
  };

  const stats = {
    total: suppliers ? suppliers.length : 0,
    withPhone: suppliers ? suppliers.filter(s => s.phone).length : 0,
    withEmail: suppliers ? suppliers.filter(s => s.email).length : 0
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Contact Person', accessor: 'contactPerson' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
    {
      header: 'Actions',
      accessor: (supplier: Supplier) => (
        <div className="flex space-x-2">
          <Link
            to={`/suppliers/edit/${supplier._id}`}
            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={() => handleDeleteClick(supplier._id)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout title="Suppliers">
        <Skeleton count={5} />
      </Layout>
    );
  }

  return (
    <Layout title="Suppliers">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Suppliers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">With Phone</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withPhone}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">With Email</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withEmail}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Suppliers</h1>
        <Link
          to="/suppliers/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus size={20} className="mr-2" />
          Add Supplier
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No suppliers found"
          description="Get started by adding a new supplier."
          actionLabel="Add Supplier"
          actionLink="/suppliers/new"
        />
      ) : (
        <DataTable columns={columns} data={suppliers} />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
      />
    </Layout>
  );
};

export default SupplierListPage;
