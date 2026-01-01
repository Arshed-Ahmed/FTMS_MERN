import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Material } from '../../types';
import { toast } from 'react-toastify';

export interface MaterialUsed {
  material: string;
  quantity: number;
  name: string;
  unit: string;
}

interface MaterialSelectorProps {
  materials: Material[];
  materialsUsed: MaterialUsed[];
  setMaterialsUsed: (materials: MaterialUsed[]) => void;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({ materials, materialsUsed, setMaterialsUsed }) => {
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState(1);

  const addMaterial = () => {
    if (!selectedMaterial || materialQuantity <= 0) return;
    
    const materialObj = materials.find(m => m._id === selectedMaterial);
    if (!materialObj) return;

    // Check if already added
    if (materialsUsed.some(m => m.material === selectedMaterial)) {
      toast.error('Material already added');
      return;
    }

    setMaterialsUsed([...materialsUsed, {
      material: selectedMaterial,
      quantity: materialQuantity,
      name: materialObj.name,
      unit: materialObj.unit
    }]);
    
    setSelectedMaterial('');
    setMaterialQuantity(1);
  };

  const removeMaterial = (materialId: string) => {
    setMaterialsUsed(materialsUsed.filter(m => m.material !== materialId));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Materials Used</h3>
      <div className="flex gap-4 mb-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
          <select
            value={selectedMaterial}
            title="Select Material"
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          >
            <option value="">Select Material</option>
            {materials.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.quantity} {m.unit} available)
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            title="Material Quantity"
            value={materialQuantity}
            onChange={(e) => setMaterialQuantity(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={addMaterial}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-1" /> Add
        </button>
      </div>

      {materialsUsed.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {materialsUsed.map((item) => (
                <tr key={item.material}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      title="Remove Material"
                      onClick={() => removeMaterial(item.material)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaterialSelector;
