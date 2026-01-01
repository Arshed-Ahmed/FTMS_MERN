import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, UserCheck, User } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { useUsers } from '../hooks/useQueries';
import { useDeleteUser } from '../hooks/useMutations';
import { API_URL } from '../constants';

const UserListPage = () => {
  const { data: users, isLoading: loading } = useUsers();
  const deleteUserMutation = useDeleteUser();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    deleteUserMutation.mutate(userToDelete, {
      onSuccess: () => {
        toast.success('User deleted successfully');
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting user');
      }
    });
  };

  const columns = [
    {
      header: 'Username',
      accessor: 'username',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img 
                src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} 
                alt={user.username} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <UserCheck className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
        </span>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      render: (user) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        }`}>
          {user.role}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (user) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {user.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (user) => (
        <div className="flex justify-end items-center">
          <Link to={`/users/${user._id}/edit`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4">
            <Edit className="w-5 h-5 inline" />
          </Link>
          <button onClick={() => handleDeleteClick(user._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
            <Trash2 className="w-5 h-5 inline" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="User Management">
      <div className="mb-6 flex justify-end items-center">
        <Link
          to="/users/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
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
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Get started by adding a new user."
          icon={User}
          actionLabel="Add User"
          actionLink="/users/add"
        />
      ) : (
        <DataTable columns={columns} data={users} searchPlaceholder="Search users..." />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default UserListPage;
