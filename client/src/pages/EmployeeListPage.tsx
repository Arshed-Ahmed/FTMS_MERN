import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, UserCheck, Eye, Users, Briefcase } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useEmployees } from '../hooks/useQueries';
import { useDeleteEmployee } from '../hooks/useMutations';
import { Employee } from '../types';

const EmployeeListPage = () => {
  const { data: employees, isLoading: loading } = useEmployees();
  const deleteEmployeeMutation = useDeleteEmployee();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setEmployeeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    deleteEmployeeMutation.mutate(employeeToDelete, {
      onSuccess: () => {
        toast.success('Employee deleted successfully');
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting employee');
      }
    });
  };

  const stats = {
    total: employees ? employees.length : 0,
    permanent: employees ? employees.filter(e => e.status === 'Permanent').length : 0,
    categories: employees ? new Set(employees.map(e => e.category)).size : 0
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'firstName',
      sortable: true,
      render: (employee: Employee) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {employee.firstName} {employee.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true
    },
    {
      header: 'Phone',
      accessor: 'phone',
      sortable: true
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (employee: Employee) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          employee.status === 'Permanent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }`}>
          {employee.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (employee: Employee) => (
        <div className="flex justify-end items-center">
          <Link to={`/employees/${employee._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4" title="View Profile">
            <Eye className="w-5 h-5 inline" />
          </Link>
          <Link to={`/employees/${employee._id}/edit`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4" title="Edit">
            <Edit className="w-5 h-5 inline" />
          </Link>
          <button onClick={() => handleDeleteClick(employee._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete">
            <Trash2 className="w-5 h-5 inline" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Employees">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Permanent Staff</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.permanent}</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Departments</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end items-center">
        <Link
          to="/employees/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
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
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Get started by adding a new employee."
          icon={UserCheck}
          actionLabel="Add Employee"
          actionLink="/employees/add"
        />
      ) : (
        <DataTable columns={columns} data={employees} searchPlaceholder="Search employees..." />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default EmployeeListPage;
