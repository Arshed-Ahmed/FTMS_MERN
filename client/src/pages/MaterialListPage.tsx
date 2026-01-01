import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Package, Eye, AlertTriangle, DollarSign, Layers } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useMaterials } from '../hooks/useQueries';
import { useDeleteMaterial } from '../hooks/useMutations';
import { IMaterial } from '@shared/types';

const MaterialListPage = () => {
  const { data: materialsData, isLoading: loading } = useMaterials();
  const materials = materialsData || [];
  const deleteMaterialMutation = useDeleteMaterial();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setMaterialToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!materialToDelete) return;

    try {
      await deleteMaterialMutation.mutateAsync(materialToDelete);
      toast.success('Material deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting material');
    } finally {
      setIsDeleteModalOpen(false);
      setMaterialToDelete(null);
    }
  };

  const stats = {
    total: materials ? materials.length : 0,
    lowStock: materials ? materials.filter(m => m.quantity <= m.lowStockThreshold).length : 0,
    totalValue: materials ? materials.reduce((acc, curr) => acc + (curr.quantity * curr.costPerUnit), 0) : 0,
    types: materials ? new Set(materials.map(m => m.type)).size : 0
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      render: (material: IMaterial) => (
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{material.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{material.color}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      sortable: true,
      render: (material: IMaterial) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {material.type}
        </span>
      )
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      sortable: true,
      render: (material: IMaterial) => (
        <div>
          <div className={`text-sm font-medium ${material.quantity <= material.lowStockThreshold ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {material.quantity} {material.unit}
          </div>
          {material.quantity <= material.lowStockThreshold && (
            <div className="text-xs text-red-500 dark:text-red-400">Low Stock</div>
          )}
        </div>
      )
    },
    {
      header: 'Unit Cost',
      accessor: 'costPerUnit',
      sortable: true,
      render: (material: IMaterial) => `$${material.costPerUnit.toFixed(2)}`
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      sortable: true,
      render: (material: IMaterial) => material.supplier || '-'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (material: Material) => (
        <div className="flex justify-end items-center">
          <Link to={`/materials/${material._id}`} className="text-blue-600 hover:text-blue-900 mr-4" title="View Details">
            <Eye className="w-5 h-5 inline" />
          </Link>
          <Link to={`/materials/${material._id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4" title="Edit">
            <Edit className="w-5 h-5 inline" />
          </Link>
          <button onClick={() => handleDeleteClick(material._id)} className="text-red-600 hover:text-red-900" title="Delete">
            <Trash2 className="w-5 h-5 inline" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Inventory Management">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inventory Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.types}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end items-center">
        <Link
          to="/materials/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Material
        </Link>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No materials found"
          description="Get started by adding materials to your inventory."
          actionLabel="Add Material"
          onAction={() => window.location.href = '/materials/add'}
        />
      ) : (
        <DataTable columns={columns} data={materials} searchPlaceholder="Search materials..." />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Material"
        message="Are you sure you want to delete this material? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default MaterialListPage;
