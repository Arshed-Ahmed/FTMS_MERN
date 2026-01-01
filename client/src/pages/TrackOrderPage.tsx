import { useState } from 'react';
import { useTrackOrder } from '../hooks/useQueries';
import { Search, Package, Calendar, DollarSign, User, Scissors, Ruler, CheckCircle, Truck, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackOrderPage = () => {
  const [inputOrderId, setInputOrderId] = useState('');
  const [searchId, setSearchId] = useState('');
  
  const { data: order, isLoading, error, isError } = useTrackOrder(searchId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputOrderId.trim()) return;
    setSearchId(inputOrderId);
  };


  const timelineStages = [
    { id: 'Measured', label: 'Measured', icon: Ruler, description: 'Measurements taken' },
    { id: 'Cutting', label: 'Cutting', icon: Scissors, description: 'Fabric is being cut' },
    { id: 'Stitching', label: 'Stitching', icon: Shirt, description: 'Stitching in progress' },
    { id: 'Trial', label: 'Trial', icon: User, description: 'Ready for trial' },
    { id: 'Ready', label: 'Ready', icon: CheckCircle, description: 'Ready for pickup' },
    { id: 'Delivered', label: 'Delivered', icon: Truck, description: 'Order delivered' },
  ];

  // Map legacy/simple statuses to timeline index
  const getStatusIndex = (status) => {
    const statusMap = {
      'Pending': 0,
      'Measured': 0,
      'In Progress': 1, // Maps to Cutting roughly
      'Cutting': 1,
      'Stitching': 2,
      'Trial': 3,
      'Ready': 4,
      'Delivered': 5
    };
    return statusMap[status] !== undefined ? statusMap[status] : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-600 p-3 rounded-full">
            <Scissors className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Track Your Order
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your Order ID to see the current status
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-200">
          <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSearch}>
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Order ID
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="orderId"
                  name="orderId"
                  type="text"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="e.g. 65a1b2c3d4e5f6..."
                  value={inputOrderId}
                  onChange={(e) => setInputOrderId(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Track Order'}
              </button>
            </div>
          </form>

          {isError && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 max-w-md mx-auto">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{(error as any)?.response?.data?.message || 'Order not found. Please check the ID.'}</p>
                </div>
              </div>
            </div>
          )}

          {order && (
            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="relative mb-12">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
                <div 
                  className="hidden md:block absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-1000"
                  style={{ width: `${(getStatusIndex(order.status) / (timelineStages.length - 1)) * 100}%` }}
                ></div>

                <div className="flex flex-col md:flex-row justify-between relative z-10">
                  {timelineStages.map((stage, index) => {
                    const currentIndex = getStatusIndex(order.status);
                    const isCompleted = index <= currentIndex;
                    // const isCurrent = index === currentIndex;
                    const Icon = stage.icon;

                    return (
                      <div key={stage.id} className="flex md:flex-col items-center mb-6 md:mb-0 group">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                          isCompleted 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="ml-4 md:ml-0 md:mt-3 md:text-center">
                          <p className={`text-sm font-bold ${isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {stage.label}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 hidden md:block">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <User className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Details</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{order.customerName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Order for {order.styleName || 'Custom Item'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <Calendar className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Schedule</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {new Date(order.deliveryDate).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.ceil((new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center space-x-4">
            <Link to="/lookbook" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              View Lookbook
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
