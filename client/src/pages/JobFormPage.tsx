import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { Job, Order, Employee } from '../types';
import { useJob, useOrders, useEmployees } from '../hooks/useQueries';
import { useCreateJob, useUpdateJob } from '../hooks/useMutations';

const JobFormPage = () => {
  const [order, setOrder] = useState('');
  const [employee, setEmployee] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('Pending');

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: orders = [] } = useOrders();
  const { data: employees = [] } = useEmployees();
  const { data: job, isLoading: isJobLoading } = useJob(id || '');
  
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();

  useEffect(() => {
    if (job) {
      setOrder(typeof job.order === 'object' ? job.order._id : job.order);
      setEmployee(typeof job.employee === 'object' ? job.employee._id : job.employee);
      setAssignedDate(job.assignedDate ? new Date(job.assignedDate).toISOString().split('T')[0] : '');
      setDeadline(job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '');
      setDetails(job.details);
      setStatus(job.status);
    }
  }, [job]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const jobData = {
        order,
        employee,
        assignedDate,
        deadline,
        details,
        status,
      };

      if (isEditMode) {
        await updateJobMutation.mutateAsync({ id: id!, data: jobData });
        toast.success('Job updated successfully');
      } else {
        await createJobMutation.mutateAsync(jobData);
        toast.success('Job created successfully');
      }
      navigate('/jobs');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving job');
    }
  };

  if (isEditMode && isJobLoading) {
    return (
      <Layout title="Edit Job Card">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Job Card' : 'New Job Card'}>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
            <select
              required
              title="Order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">Select Order</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  Order #{o._id.slice(-6)} - {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown'} ({o.style?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To (Employee)</label>
            <select
              required
              title="Employee"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName} - {e.category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Date</label>
              <input
                type="date"
                required
                title="Assigned Date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
              <input
                type="date"
                required
                title="Deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={status}
              title="Status"
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Details / Instructions</label>
            <textarea
              rows={4}
              title="Job Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Specific instructions for the tailor..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createJobMutation.isPending || updateJobMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createJobMutation.isPending || updateJobMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Job' : 'Assign Job')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default JobFormPage;
