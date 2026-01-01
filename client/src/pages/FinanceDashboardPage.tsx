import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import { useFinanceSummary, useTransactions } from '../hooks/useQueries';

const FinanceDashboardPage = () => {
  const { data: summaryData, isLoading: summaryLoading } = useFinanceSummary();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions();

  const summary = summaryData || { income: 0, expense: 0, netProfit: 0 };
  const transactions = transactionsData || [];

  const columns = [
    { 
      header: 'Date', 
      accessor: (t) => new Date(t.date).toLocaleDateString() 
    },
    { 
      header: 'Type', 
      accessor: (t) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          t.type === 'INCOME' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {t.type}
        </span>
      )
    },
    { header: 'Category', accessor: 'category' },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Amount', 
      accessor: (t) => (
        <span className={t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
          {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
        </span>
      ) 
    },
    { header: 'Reference', accessor: 'reference' },
  ];

  if (summaryLoading || transactionsLoading) {
    return (
      <Layout title="Finance Dashboard">
        <Skeleton count={5} />
      </Layout>
    );
  }

  return (
    <Layout title="Finance Dashboard">
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Income
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    ${summary.income.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Expenses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    ${summary.expense.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Net Profit
                  </dt>
                  <dd className={`text-lg font-medium ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summary.netProfit.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h2>
        <DataTable columns={columns} data={transactions} />
      </div>
    </Layout>
  );
};

export default FinanceDashboardPage;
