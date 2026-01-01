import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
// import { useAuth } from '../context/AuthContext';
import { useSupplier } from '../hooks/useQueries';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useMutations';

interface SupplierFormState {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

const SupplierFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const { userInfo } = useAuth();
  const isEditMode = !!id;

  const { data: supplier, isLoading: isLoadingSupplier } = useSupplier(id!);
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  const [formData, setFormData] = useState<SupplierFormState>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (isEditMode && supplier) {
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
      });
    }
  }, [isEditMode, supplier]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && id) {
        await updateSupplierMutation.mutateAsync({ id, data: formData });
        toast.success('Supplier updated successfully');
      } else {
        await createSupplierMutation.mutateAsync(formData);
        toast.success('Supplier created successfully');
      }
      navigate('/suppliers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving supplier');
    }
  };

  if (isEditMode && isLoadingSupplier) {
    return (
      <Layout title={isEditMode ? 'Edit Supplier' : 'New Supplier'}>
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
           </div>
           <Skeleton className="h-24 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Supplier' : 'New Supplier'}>
      <div className="mb-6">
        <button
          onClick={() => navigate('/suppliers')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Suppliers
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                name="name"
                title="Supplier Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                title="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                title="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                title="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                name="address"
                title="Address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save size={20} className="mr-2" />
              {createSupplierMutation.isPending || updateSupplierMutation.isPending ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SupplierFormPage;
