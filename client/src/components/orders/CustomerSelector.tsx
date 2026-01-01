import React from 'react';
import { Customer } from '../../types';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onChange: (customerId: string) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ customers, selectedCustomerId, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
      <select
        required
        title="Customer"
        value={selectedCustomerId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
      >
        <option value="">Select Customer</option>
        {customers.map((c) => (
          <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.phone})</option>
        ))}
      </select>
    </div>
  );
};

export default CustomerSelector;
