import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { Customer } from '../types';
import { useCustomer } from '../hooks/useQueries';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useMutations';

interface MeasurementHistoryItem {
  date: string;
  orderId: string;
  measurements: Record<string, string | number>;
}

interface CustomerWithHistory extends Customer {
  measurementHistory?: MeasurementHistoryItem[];
}

const CustomerFormPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nic: '',
    phone: '',
    email: '',
    address: '',
  });

  const [measurementHistory, setMeasurementHistory] = useState<MeasurementHistoryItem[]>([]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: customer, isLoading } = useCustomer(id || '');
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  useEffect(() => {
    if (customer) {
      const customerData = customer as unknown as CustomerWithHistory;
      setFormData({
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        nic: customerData.nic || '',
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address || '',
      });
      if (customerData.measurementHistory) {
        setMeasurementHistory(customerData.measurementHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    }
  }, [customer]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateCustomerMutation.mutateAsync({ id: id!, data: formData });
        toast.success('Customer updated successfully');
      } else {
        await createCustomerMutation.mutateAsync(formData);
        toast.success('Customer added successfully');
      }
      navigate('/customers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving customer');
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Layout title="Edit Customer">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Customer' : 'Add Customer'}>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                title="First Name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                title="Last Name"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIC</label>
              <input
                type="text"
                name="nic"
                title="NIC"
                required
                value={formData.nic}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                title="Phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              title="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              name="address"
              title="Address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createCustomerMutation.isPending || updateCustomerMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Save Customer')}
            </button>
          </div>
        </form>

        {isEditMode && measurementHistory.length > 0 && (
          <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Measurement History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Measurements</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {measurementHistory.map((history, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(history.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => navigate(`/orders/${history.orderId}`)}>
                        {history.orderId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(history.measurements).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerFormPage;
