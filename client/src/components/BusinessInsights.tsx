import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';

const BusinessInsights = ({ orders = [], customers = [] }) => {
  // Helper to get insights
  const getInsights = () => {
    const insights = [];
    
    if (orders.length === 0) return [];

    // 1. Revenue Trend (Current Month vs Last Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const lastMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === (currentMonth - 1 + 12) % 12 && 
             d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
    });

    const currentRevenue = currentMonthOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const lastRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.price || 0), 0);

    if (currentRevenue > lastRevenue) {
      const growth = lastRevenue === 0 ? 100 : ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(1);
      insights.push({
        type: 'positive',
        icon: TrendingUp,
        title: 'Revenue Growth',
        message: `Revenue is up ${growth}% compared to last month. Great job!`
      });
    } else if (currentRevenue < lastRevenue) {
      const drop = ((lastRevenue - currentRevenue) / lastRevenue * 100).toFixed(1);
      insights.push({
        type: 'negative',
        icon: TrendingDown,
        title: 'Revenue Dip',
        message: `Revenue is down ${drop}% compared to last month. Consider running a promotion.`
      });
    }

    // 2. Top Selling Category
    const categoryCounts = {};
    orders.forEach(order => {
        // Assuming order has items or style category. 
        // If order structure is simple (one style per order):
        const cat = order.styleName || 'Custom'; // Fallback
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    let topCategory = null;
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
            maxCount = count;
            topCategory = cat;
        }
    });

    if (topCategory) {
        insights.push({
            type: 'neutral',
            icon: Award,
            title: 'Top Seller',
            message: `"${topCategory}" is your most popular item this period.`
        });
    }

    // 3. Customer Retention
    // Simple check: % of orders from repeat customers
    const customerOrders = {};
    orders.forEach(o => {
        if (o.customer?._id) {
            customerOrders[o.customer._id] = (customerOrders[o.customer._id] || 0) + 1;
        }
    });
    
    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
    const totalActiveCustomers = Object.keys(customerOrders).length;
    
    if (totalActiveCustomers > 0) {
        const retentionRate = ((repeatCustomers / totalActiveCustomers) * 100).toFixed(0);
        if (retentionRate > 20) {
            insights.push({
                type: 'positive',
                icon: Users,
                title: 'High Retention',
                message: `${retentionRate}% of your active customers are repeat buyers.`
            });
        }
    }

    // 4. New Customers (Last 30 days)
    const newCustomers = customers.filter(c => {
        const d = new Date(c.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d >= thirtyDaysAgo;
    }).length;

    if (newCustomers > 0) {
        insights.push({
            type: 'positive',
            icon: Users,
            title: 'Growing Base',
            message: `You acquired ${newCustomers} new customers in the last 30 days.`
        });
    }

    return insights;
  };

  const insights = getInsights();

  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-8 border border-indigo-100 dark:border-gray-600">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI Business Insights</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 flex items-start space-x-3">
            <div className={`p-2 rounded-full shrink-0 ${
              insight.type === 'positive' ? 'bg-green-100 text-green-600' :
              insight.type === 'negative' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <insight.icon size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{insight.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Users } from 'lucide-react'; // Import missing icon

export default BusinessInsights;
