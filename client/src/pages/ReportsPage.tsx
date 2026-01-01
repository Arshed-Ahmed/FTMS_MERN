import { useState, useMemo, useRef } from 'react';
import { 
  FileText, Filter, Package, DollarSign, Truck, Printer, PieChart,
  TrendingUp, TrendingDown, Clock, Users, Mail, Phone, AlertTriangle, CheckCircle, Activity
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import ReportSummary from '../components/ReportSummary';
import BusinessInsights from '../components/BusinessInsights';
import { 
  useOrders, useCustomers, useEmployees, useMaterials, 
  useTransactions, useSuppliers 
} from '../hooks/useQueries';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [dateRange, setDateRange] = useState<{ startDate: string, endDate: string }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: materials = [], isLoading: isLoadingMaterials } = useMaterials();
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions();
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useSuppliers();

  const loading = isLoadingOrders || isLoadingCustomers || isLoadingEmployees || isLoadingMaterials || isLoadingTransactions || isLoadingSuppliers;

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Business_Analytics_Report',
  });

  const data = useMemo(() => {
    let rawData: any[] = [];
    if (activeTab === 'orders') rawData = orders;
    else if (activeTab === 'customers') rawData = customers;
    else if (activeTab === 'employees') rawData = employees;
    else if (activeTab === 'inventory') rawData = materials;
    else if (activeTab === 'finance') rawData = transactions;
    else if (activeTab === 'suppliers') rawData = suppliers;

    if (activeTab === 'orders' || activeTab === 'finance') {
      return rawData.filter((item: any) => {
        const date = new Date(item.createdAt || item.date);
        return date >= new Date(dateRange.startDate) && date <= new Date(dateRange.endDate);
      });
    }
    return rawData;
  }, [activeTab, orders, customers, employees, materials, transactions, suppliers, dateRange]);

  const summaryData = useMemo(() => ({ orders, customers }), [orders, customers]);

  const colorVariants: Record<string, { bg: string, text: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' }
  };

  const getTabStats = () => {
    if (!data) return null;

    switch (activeTab) {
      case 'orders': {
        const totalRevenue = data.reduce((acc: number, curr: any) => acc + (Number(curr.price) || 0), 0);
        return [
          { label: 'Total Orders', value: data.length, icon: FileText, color: 'blue' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green' },
          { label: 'Avg. Order Value', value: `$${(totalRevenue / (data.length || 1)).toFixed(2)}`, icon: TrendingUp, color: 'purple' },
          { label: 'Pending Orders', value: data.filter((o: any) => o.status === 'Pending').length, icon: Clock, color: 'yellow' }
        ];
      }
      case 'customers':
        return [
            { label: 'Total Customers', value: data.length, icon: Users, color: 'blue' },
            { label: 'With Email', value: data.filter((c: any) => c.email).length, icon: Mail, color: 'purple' },
            { label: 'With Phone', value: data.filter((c: any) => c.phone).length, icon: Phone, color: 'green' },
        ];
      case 'inventory': {
        const totalValue = data.reduce((acc: number, curr: any) => acc + ((curr.quantity || 0) * (curr.costPerUnit || 0)), 0);
        return [
            { label: 'Total Items', value: data.length, icon: Package, color: 'blue' },
            { label: 'Low Stock', value: data.filter((m: any) => m.quantity <= m.lowStockThreshold).length, icon: AlertTriangle, color: 'red' },
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'green' },
        ];
      }
      case 'finance': {
        const income = data.filter((t: any) => t.type === 'INCOME').reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        const expense = data.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        return [
            { label: 'Total Income', value: `$${income.toLocaleString()}`, icon: TrendingUp, color: 'green' },
            { label: 'Total Expenses', value: `$${expense.toLocaleString()}`, icon: TrendingDown, color: 'red' },
            { label: 'Net Profit', value: `$${(income - expense).toLocaleString()}`, icon: Activity, color: 'blue' },
        ];
      }
      case 'suppliers':
        return [
            { label: 'Total Suppliers', value: data.length, icon: Truck, color: 'blue' },
            { label: 'With Email', value: data.filter((s: any) => s.email).length, icon: Mail, color: 'purple' },
        ];
      case 'employees':
        return [
            { label: 'Total Employees', value: data.length, icon: Users, color: 'blue' },
            { label: 'Permanent', value: data.filter((e: any) => e.status === 'Permanent').length, icon: CheckCircle, color: 'green' },
        ];
      default:
        return null;
    }
  };

  const columns = useMemo(() => {
    if (activeTab === 'orders') {
      return [
        { 
          header: 'Order ID', 
          accessor: '_id', 
          sortable: true, 
          render: (item: any) => <span className="font-medium text-gray-900 dark:text-white">#{item._id.slice(-6)}</span> 
        },
        { 
          header: 'Customer', 
          accessor: 'customer.name', 
          sortable: true,
          render: (item: any) => item.customer?.name || 'Unknown'
        },
        { 
          header: 'Date', 
          accessor: 'createdAt', 
          sortable: true, 
          render: (item: any) => new Date(item.createdAt).toLocaleDateString() 
        },
        { 
          header: 'Status', 
          accessor: 'status', 
          sortable: true 
        },
        { 
          header: 'Amount', 
          accessor: 'price', 
          sortable: true, 
          align: 'right', 
          render: (item: any) => `$${item.price}` 
        },
      ];
    } else if (activeTab === 'customers') {
      return [
        { header: 'Name', accessor: 'name', sortable: true, render: (item: any) => <span className="font-medium text-gray-900 dark:text-white">{item.name}</span> },
        { header: 'Phone', accessor: 'phone', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { header: 'Address', accessor: 'address', sortable: true },
      ];
    } else if (activeTab === 'employees') {
      return [
        { header: 'Name', accessor: 'name', sortable: true, render: (item: any) => <span className="font-medium text-gray-900 dark:text-white">{item.name}</span> },
        { header: 'Role', accessor: 'role', sortable: true },
        { header: 'Phone', accessor: 'phone', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { header: 'Status', accessor: 'status', sortable: true },
      ];
    } else if (activeTab === 'inventory') {
      return [
        { header: 'Material', accessor: 'name', sortable: true },
        { header: 'Type', accessor: 'type', sortable: true },
        { header: 'Quantity', accessor: 'quantity', sortable: true, render: (item: any) => `${item.quantity} ${item.unit}` },
        { header: 'Unit Cost', accessor: 'costPerUnit', sortable: true, render: (item: any) => `$${item.costPerUnit}` },
        { header: 'Total Value', accessor: 'totalValue', render: (item: any) => `$${(item.quantity * item.costPerUnit).toFixed(2)}` },
      ];
    } else if (activeTab === 'finance') {
      return [
        { header: 'Date', accessor: 'date', sortable: true, render: (item: any) => new Date(item.date).toLocaleDateString() },
        { header: 'Type', accessor: 'type', sortable: true, render: (item: any) => <span className={item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>{item.type}</span> },
        { header: 'Category', accessor: 'category', sortable: true },
        { header: 'Amount', accessor: 'amount', sortable: true, render: (item: any) => `$${item.amount.toFixed(2)}` },
        { header: 'Reference', accessor: 'reference' },
      ];
    } else if (activeTab === 'suppliers') {
      return [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Contact', accessor: 'contactPerson', sortable: true },
        { header: 'Email', accessor: 'email', sortable: true },
        { header: 'Phone', accessor: 'phone', sortable: true },
      ];
    }
    return [];
  }, [activeTab]);

  return (
    <Layout title="Business Analytics">
      <div className="max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Navigation - Full Width */}
          <div className="w-full overflow-x-auto pb-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg min-w-max md:min-w-0 md:w-full">
              {[
                { id: 'summary', label: 'Dashboard', icon: PieChart },
                { id: 'orders', label: 'Orders', icon: FileText },
                { id: 'customers', label: 'Customers', icon: Filter },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'finance', label: 'Finance', icon: DollarSign },
                { id: 'suppliers', label: 'Suppliers', icon: Truck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex justify-end items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                <input 
                    type="date" 
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 dark:text-gray-300"
                    aria-label="Start Date"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date" 
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 dark:text-gray-300"
                    aria-label="End Date"
                />
            </div>
            <button
              onClick={() => handlePrint()}
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        <div ref={componentRef} className="print:p-8">
            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Business Analytics Report</h1>
                <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            ) : (
            <>
                {activeTab === 'summary' ? (
                <div className="space-y-8 animate-fadeIn">
                    <BusinessInsights orders={summaryData.orders} customers={summaryData.customers} />
                    <ReportSummary orders={summaryData.orders} customers={summaryData.customers} />
                </div>
                ) : (
                <div className="space-y-6 animate-fadeIn">
                    {/* Tab Stats Grid */}
                    {getTabStats() && (
                        <div className={`grid grid-cols-1 md:grid-cols-${getTabStats()!.length > 3 ? '4' : getTabStats()!.length} gap-4`}>
                            {getTabStats()!.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 ${colorVariants[stat.color].bg} rounded-lg`}>
                                        <stat.icon className={`w-6 h-6 ${colorVariants[stat.color].text}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {activeTab} Report
                            </h3>
                            <span className="text-sm text-gray-500">
                                {data.length} records found
                            </span>
                        </div>
                        <DataTable
                        columns={columns}
                        data={data}
                        searchPlaceholder={`Search ${activeTab}...`}
                        />
                    </div>
                </div>
                )}
            </>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
