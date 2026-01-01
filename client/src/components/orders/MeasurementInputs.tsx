import React from 'react';

interface MeasurementInputsProps {
  measurementFields: string[];
  measurementSnapshot: Record<string, string>;
  handleMeasurementChange: (key: string, value: string) => void;
}

const MeasurementInputs: React.FC<MeasurementInputsProps> = ({ measurementFields, measurementSnapshot, handleMeasurementChange }) => {
  if (measurementFields.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Measurements</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {measurementFields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field}</label>
            <input
              type="text"
              title={field}
              value={measurementSnapshot[field] || ''}
              onChange={(e) => handleMeasurementChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeasurementInputs;
