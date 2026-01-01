import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, ShoppingBag, 
  Ruler, Clock, MessageCircle, Edit, ArrowLeft 
} from 'lucide-react';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import { useCustomer, useOrders } from '../hooks/useQueries';

const CustomerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(id!);
  // Pass customer ID as param, assuming backend might support it. 
  // Even if not, we filter below.
  const { data: ordersData = [], isLoading: isLoadingOrders } = useOrders({ customer: id });

  const loading = isLoadingCustomer || isLoadingOrders;

  if (loading) {
    return (
      <Layout title="Customer Profile">
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

  if (!customer) {
    return (
      <Layout title="Customer Not Found">
        <EmptyState 
          title="Customer not found" 
          description="The customer you are looking for does not exist or has been deleted."
          icon={User}
          actionLabel="Back to Customers"
          actionLink="/customers"
        />
      </Layout>
    );
  }

  // Filter orders just in case backend returns all
  const orders = ordersData.filter((order: any) => 
    (order.customer?._id === id) || (order.customer === id)
  );

  const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.price || 0), 0);
  const lastOrderDate = orders.length > 0 
    ? new Date(Math.max(...orders.map((o: any) => new Date(o.createdAt).getTime()))).toLocaleDateString() 
    : 'Never';

  const orderColumns = [
    { 
      header: 'Order ID', 
      accessor: '_id', 
      render: (order: any) => <Link to={`/orders/${order._id}/edit`} className="text-blue-600 hover:underline">#{order._id.slice(-6)}</Link>
    },
    { 
      header: 'Date', 
      accessor: 'createdAt', 
      render: (order: any) => new Date(order.createdAt).toLocaleDateString() 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (order: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {order.status}
        </span>
      )
    },
    { 
      header: 'Amount', 
      accessor: 'price', 
      align: 'right',
      render: (order: any) => `$${order.price}` 
    }
  ];

  return (
    <Layout title="Customer Profile">
      <div className="mb-6">
        <Link to="/customers" className="text-gray-500 hover:text-gray-700 flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Customers
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold mr-4">
              {customer.firstName[0]}{customer.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer.firstName} {customer.lastName}
              </h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {customer.address}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <a 
              href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
            <Link 
              to={`/customers/${customer._id}/edit`}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</h3>
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Order</h3>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{lastOrderDate}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Measurements</h3>
            <Ruler className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {customer.measurementHistory?.length || 0} <span className="text-sm font-normal text-gray-500">updates</span>
          </p>
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
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('measurements')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'measurements'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Measurements
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                    {customer.address}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <User className="w-5 h-5 mr-3 text-gray-400" />
                    NIC: {customer.nic}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order: any) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order._id.slice(-6)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No recent activity.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {orders.length > 0 ? (
                <DataTable columns={orderColumns} data={orders} />
              ) : (
                <EmptyState
                  title="No orders yet"
                  description="This customer hasn't placed any orders yet."
                  icon={ShoppingBag}
                />
              )}
            </div>
          )}

          {activeTab === 'measurements' && (
            <div>
              {customer.measurementHistory && customer.measurementHistory.length > 0 ? (
                <div className="space-y-6">
                  {customer.measurementHistory.map((history: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Recorded on {new Date(history.date).toLocaleDateString()}
                        </h4>
                        {history.orderId && (
                          <span className="text-sm text-gray-500">
                            Order Ref: #{history.orderId.toString().slice(-6)}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {history.measurements && Object.entries(history.measurements).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{value as string}</p>
                          </div>
                        ))}
                      </div>
                      {history.notes && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                          <span className="font-medium">Notes:</span> {history.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No measurement history"
                  description="No measurement records found for this customer."
                  icon={Ruler}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CustomerProfilePage;
