import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, DollarSign, AlertTriangle, ShoppingBag, 
  ArrowLeft, Edit, TrendingDown, History 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import { useMaterial, useOrders } from '../hooks/useQueries';

const MaterialProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: material, isLoading: isLoadingMaterial } = useMaterial(id!);
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();

  const loading = isLoadingMaterial || isLoadingOrders;

  const usageHistory = useMemo(() => {
    if (!material || !orders.length) return [];

    // Find orders that used this material
    const relevantOrders = orders.filter((order: any) => 
      order.materialsUsed && order.materialsUsed.some((m: any) => 
        (m.material?._id === id) || (m.material === id)
      )
    );

    // Map to a cleaner history format
    return relevantOrders.map((order: any) => {
      const usage = order.materialsUsed.find((m: any) => 
        (m.material?._id === id) || (m.material === id)
      );
      return {
        _id: order._id,
        date: order.createdAt,
        orderId: order._id,
        quantityUsed: usage.quantity,
        customer: order.customer
      };
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [material, orders, id]);

  const stats = useMemo(() => {
    if (!material) return {};
    const totalUsed = usageHistory.reduce((sum, item) => sum + item.quantityUsed, 0);
    const stockValue = material.quantity * material.costPerUnit;
    const isLowStock = material.quantity <= material.lowStockThreshold;

    return { totalUsed, stockValue, isLowStock };
  }, [material, usageHistory]);

  // Mock data for stock trend (since we don't have real historical stock data yet)
  // We can simulate it by working backwards from current stock + usage
  const stockTrendData = useMemo(() => {
    if (!material) return [];
    let currentStock = material.quantity;
    const data = [];
    
    // Add current state
    data.push({ date: new Date().toLocaleDateString(), stock: currentStock });

    // Work backwards through usage history
    usageHistory.forEach(item => {
      currentStock += item.quantityUsed;
      data.push({ 
        date: new Date(item.date).toLocaleDateString(), 
        stock: currentStock 
      });
    });

    return data.reverse();
  }, [material, usageHistory]);

  if (loading) {
    return (
      <Layout title="Material Details">
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

  if (!material) {
    return (
      <Layout title="Material Not Found">
        <EmptyState 
          title="Material not found" 
          description="The material you are looking for does not exist or has been deleted."
          icon={Package}
          actionLabel="Back to Inventory"
          actionLink="/materials"
        />
      </Layout>
    );
  }

  const historyColumns = [
    { 
      header: 'Date', 
      accessor: 'date', 
      render: (item) => new Date(item.date).toLocaleDateString() 
    },
    { 
      header: 'Order Ref', 
      accessor: 'orderId', 
      render: (item) => <Link to={`/orders/${item.orderId}/edit`} className="text-blue-600 hover:underline">#{item.orderId.slice(-6)}</Link>
    },
    { 
      header: 'Used Amount', 
      accessor: 'quantityUsed', 
      render: (item) => (
        <span className="font-medium text-red-600 dark:text-red-400 flex items-center">
          <TrendingDown className="w-4 h-4 mr-1" />
          -{item.quantityUsed} {material.unit}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer',
      render: (item) => item.customer?.name || item.customer?.firstName || 'Unknown'
    }
  ];

  return (
    <Layout title="Material Details">
      <div className="mb-6">
        <Link to="/materials" className="text-gray-500 hover:text-gray-700 flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inventory
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold mr-4">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {material.name}
              </h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium mr-2">
                  {material.type}
                </span>
                {material.color && <span className="mr-2">• {material.color}</span>}
                {material.sku && <span>• SKU: {material.sku}</span>}
              </div>
            </div>
          </div>
          
          <Link 
            to={`/materials/${material._id}/edit`}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Material
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stock</h3>
            <Package className={`w-5 h-5 ${stats.isLowStock ? 'text-red-500' : 'text-blue-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${stats.isLowStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
            {material.quantity} <span className="text-sm font-normal text-gray-500">{material.unit}</span>
          </p>
          {stats.isLowStock && (
            <p className="text-xs text-red-500 mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock Alert
            </p>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.stockValue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">@ ${material.costPerUnit}/{material.unit}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Used</h3>
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalUsed} <span className="text-sm font-normal text-gray-500">{material.unit}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</h3>
            <ShoppingBag className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={material.supplier}>
            {material.supplier || 'N/A'}
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
              Overview & Trends
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Usage History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Level Trend</h3>
                <div className="h-80 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockTrendData}>
                      <defs>
                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Area type="monotone" dataKey="stock" stroke="#6366f1" fillOpacity={1} fill="url(#colorStock)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
                <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Description</p>
                    <p className="text-gray-900 dark:text-white mt-1">{material.description || 'No description provided.'}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Low Stock Threshold</p>
                    <p className="text-gray-900 dark:text-white mt-1">{material.lowStockThreshold} {material.unit}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Last Updated</p>
                    <p className="text-gray-900 dark:text-white mt-1">{new Date(material.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {usageHistory.length > 0 ? (
                <DataTable columns={historyColumns} data={usageHistory} />
              ) : (
                <EmptyState
                  title="No usage history"
                  description="This material hasn't been used in any orders yet."
                  icon={History}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MaterialProfilePage;
