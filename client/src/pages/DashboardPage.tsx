import { Link } from 'react-router-dom';
import { ShoppingBag, Users, DollarSign, Clock, UserCheck, Briefcase, CheckCircle, AlertTriangle, Truck, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import DashboardCharts from '../components/DashboardCharts';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useQueries';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link || '#'} className="block">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center transition-colors duration-200 hover:shadow-md">
      <div className={`p-3 rounded-full ${color} mr-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { userInfo: user } = useAuth();
  const { data: statsData, isLoading: loading } = useDashboardStats();

  const stats = statsData || {
    totalOrders: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    pendingOrders: 0,
    revenue: 0,
    lowStockCount: 0,
    pendingPO: 0,
    netProfit: 0,
    ordersByStatus: [],
    recentOrders: []
  };

  const isAdmin = user?.role === 'Admin';

  const columns = [
    {
      header: 'Order ID',
      accessor: '_id',
      sortable: true,
      render: (order) => (
        <Link to={`/orders/${order._id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          #{order._id.slice(-6)}
        </Link>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer.firstName',
      sortable: true,
      render: (order) => order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Unknown'
    },
    {
      header: 'Due Date',
      accessor: 'deliveryDate',
      sortable: true,
      render: (order) => new Date(order.deliveryDate || order.createdAt).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
            order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
          {order.status}
        </span>
      )
    }
  ];

  if (isAdmin) {
    columns.push({
      header: 'Amount',
      accessor: 'price',
      sortable: true,
      render: (order) => `$${order.price}`
    });
  }

  return (
    <Layout title={isAdmin ? "Admin Dashboard" : "Tailor Dashboard"}>
      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 h-32">
                <div className="flex items-center space-x-4">
                  <Skeleton variant="circle" width="3rem" height="3rem" />
                  <div className="space-y-2 flex-1">
                    <Skeleton width="60%" />
                    <Skeleton width="40%" height="1.5rem" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg h-96 p-6 border border-gray-100 dark:border-gray-700">
              <Skeleton variant="text" width="30%" className="mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} height="3rem" />
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg h-96 p-6 border border-gray-100 dark:border-gray-700">
              <Skeleton variant="text" width="50%" className="mb-6" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} height="2rem" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {isAdmin ? (
              <>
                <StatCard 
                  title="Net Profit" 
                  value={`$${stats.netProfit.toLocaleString()}`} 
                  icon={TrendingUp} 
                  color={stats.netProfit >= 0 ? "bg-green-600" : "bg-red-600"}
                  link="/finance"
                />
                <StatCard 
                  title="Pending Orders" 
                  value={stats.pendingOrders} 
                  icon={Clock} 
                  color="bg-yellow-500" 
                  link="/orders"
                />
                <StatCard 
                  title="Low Stock Items" 
                  value={stats.lowStockCount} 
                  icon={AlertTriangle} 
                  color="bg-red-500" 
                  link="/materials"
                />
                <StatCard 
                  title="Pending POs" 
                  value={stats.pendingPO} 
                  icon={Truck} 
                  color="bg-indigo-500" 
                  link="/purchase-orders"
                />
              </>
            ) : (
              <>
                <StatCard 
                  title="My Active Jobs" 
                  value={stats.pendingOrders} 
                  icon={Briefcase} 
                  color="bg-blue-500" 
                />
                <StatCard 
                  title="Pending Orders" 
                  value={stats.pendingOrders} 
                  icon={Clock} 
                  color="bg-yellow-500" 
                />
                <StatCard 
                  title="Completed Jobs" 
                  value={stats.totalOrders - stats.pendingOrders} 
                  icon={CheckCircle} 
                  color="bg-green-500" 
                />
                <StatCard 
                  title="Total Customers" 
                  value={stats.totalCustomers} 
                  icon={Users} 
                  color="bg-purple-500" 
                />
              </>
            )}
          </div>

          <DashboardCharts data={stats.ordersByStatus} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200`}>
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isAdmin ? "Recent Orders" : "My Active Jobs"}
                </h3>
              </div>
              <DataTable 
                columns={columns} 
                data={stats.recentOrders} 
                searchPlaceholder="Search orders..." 
              />
            </div>

            {isAdmin && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-indigo-500 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">Active Employees</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{stats.totalEmployees}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;
