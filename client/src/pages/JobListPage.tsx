import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Briefcase, LayoutGrid, List, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import KanbanBoard from '../components/KanbanBoard';
import JobCardPrint from '../components/JobCardPrint';
import ConfirmationModal from '../components/ConfirmationModal';
import { useJobs } from '../hooks/useQueries';
import { useUpdateJobStatus, useDeleteJob } from '../hooks/useMutations';
import { Job } from '../types';

const JobListPage = () => {
  const { data: jobs, isLoading: loading } = useJobs();
  const updateJobStatusMutation = useUpdateJobStatus();
  const deleteJobMutation = useDeleteJob();

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedJob ? `JobCard-${selectedJob.order?._id}` : 'JobCard',
  });

  const onPrintClick = (job: Job) => {
    setSelectedJob(job);
    // Small timeout to allow state to update before printing
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    updateJobStatusMutation.mutate({ id: jobId, status: newStatus }, {
      onSuccess: () => toast.success(`Job moved to ${newStatus}`),
      onError: () => toast.error('Failed to update job status')
    });
  };

  const handleDeleteClick = (id: string) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    deleteJobMutation.mutate(jobToDelete, {
      onSuccess: () => {
        toast.success('Job deleted successfully');
        setIsDeleteModalOpen(false);
        setJobToDelete(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error deleting job');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const columns = [
    {
      header: 'Order / Customer',
      accessor: 'order.customer.name', // For sorting/filtering
      sortable: true,
      render: (job: Job) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">Order #{job.order?._id.slice(-6)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{job.order?.customer?.name}</div>
        </div>
      )
    },
    {
      header: 'Assigned To',
      accessor: 'employee.name',
      sortable: true,
      render: (job) => (
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{job.employee?.name || 'Unassigned'}</div>
        </div>
      )
    },
    {
      header: 'Deadline',
      accessor: 'deadline',
      sortable: true,
      render: (job) => new Date(job.deadline).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (job) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (job) => (
        <div className="flex justify-end items-center">
          <button 
            onClick={() => onPrintClick(job)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mr-4"
            title="Print Job Card"
          >
            <Printer className="w-5 h-5 inline" />
          </button>
          <Link to={`/jobs/${job._id}/edit`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4" title="Edit">
            <Edit className="w-5 h-5 inline" />
          </Link>
          <button onClick={() => handleDeleteClick(job._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete">
            <Trash2 className="w-5 h-5 inline" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Job Cards">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'board'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Board
          </button>
        </div>

        <Link
          to="/jobs/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Job Card
        </Link>
      </div>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <JobCardPrint ref={printRef} job={selectedJob} />
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
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No job cards found"
          description="Get started by creating a new job card."
          icon={Briefcase}
          actionLabel="New Job Card"
          actionLink="/jobs/add"
        />
      ) : viewMode === 'board' ? (
        <KanbanBoard jobs={jobs} onStatusChange={handleStatusChange} onPrint={onPrintClick} />
      ) : (
        <DataTable columns={columns} data={jobs} searchPlaceholder="Search jobs..." />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Job Card"
        message="Are you sure you want to delete this job card? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </Layout>
  );
};

export default JobListPage;
