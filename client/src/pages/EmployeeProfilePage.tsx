import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, Briefcase, 
  DollarSign, CheckCircle, Clock, AlertCircle, ArrowLeft, Edit 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import { useEmployee, useJobs } from '../hooks/useQueries';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B']; // Green, Blue, Yellow

const EmployeeProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id!);
  const { data: allJobs = [], isLoading: isLoadingJobs } = useJobs();

  const jobs = useMemo(() => {
    if (!allJobs) return [];
    return allJobs.filter((job: any) => 
      (job.employee?._id === id) || (job.employee === id)
    );
  }, [allJobs, id]);

  const loading = isLoadingEmployee || isLoadingJobs;

  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter((j: any) => j.status === 'Completed').length;
    const inProgress = jobs.filter((j: any) => j.status === 'In Progress').length;
    const pending = jobs.filter((j: any) => j.status === 'Pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, completionRate };
  }, [jobs]);

  const chartData = [
    { name: 'Completed', value: stats.completed },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Pending', value: stats.pending },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <Layout title="Employee Profile">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton width="200px" height="32px" />
            <Skeleton width="100px" height="40px" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton height="200px" />
            <Skeleton height="200px" />
            <Skeleton height="200px" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout title="Employee Not Found">
        <EmptyState 
          title="Employee not found" 
          description="The employee you are looking for does not exist or has been deleted."
          icon={User}
          actionLabel="Back to Employees"
          actionLink="/employees"
        />
      </Layout>
    );
  }

  const jobColumns = [
    { 
      header: 'Job ID', 
      accessor: '_id', 
      render: (job: any) => <Link to={`/jobs/${job._id}/edit`} className="text-blue-600 hover:underline">#{job._id.slice(-6)}</Link>
    },
    { 
      header: 'Order', 
      accessor: 'order', 
      render: (job: any) => job.order ? `Order #${job.order._id.slice(-6)}` : 'N/A'
    },
    { 
      header: 'Deadline', 
      accessor: 'deadline', 
      render: (job: any) => new Date(job.deadline).toLocaleDateString() 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (job: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          job.status === 'Completed' ? 'bg-green-100 text-green-800' :
          job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {job.status}
        </span>
      )
    }
  ];

  return (
    <Layout title="Employee Profile">
      <div className="mb-6">
        <Link to="/employees" className="text-gray-500 hover:text-gray-700 flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Employees
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 text-2xl font-bold mr-4">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <Briefcase className="w-4 h-4 mr-1" />
                {employee.category} • {employee.status}
              </div>
            </div>
          </div>
          
          <Link 
            to={`/employees/${employee._id}/edit`}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jobs</h3>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Jobs</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Salary</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${employee.salary?.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Base Salary</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Job History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                    {employee.phone}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                    {employee.address}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <User className="w-5 h-5 mr-3 text-gray-400" />
                    NIC: {employee.nic}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    Joined: {new Date(employee.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h3>
                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                    <p>No job data available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              {jobs.length > 0 ? (
                <DataTable columns={jobColumns} data={jobs} />
              ) : (
                <EmptyState
                  title="No jobs assigned"
                  description="This employee hasn't been assigned any jobs yet."
                  icon={Briefcase}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeProfilePage;
