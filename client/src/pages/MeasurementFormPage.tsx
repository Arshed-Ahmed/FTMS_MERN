import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import MeasurementGuide from '../components/MeasurementGuide';
import { Customer, Measurement } from '../types';
import { useMeasurement, useCustomers, useItemTypes } from '../hooks/useQueries';
import { useCreateMeasurement, useUpdateMeasurement } from '../hooks/useMutations';

interface ItemType {
  _id: string;
  name: string;
  image?: string;
  fields?: string[];
}

const MeasurementFormPage = () => {
  const [customer, setCustomer] = useState('');
  const [item, setItem] = useState('Shirt');
  const [notes, setNotes] = useState('');
  const [moreDetails, setMoreDetails] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [activeTemplateImage, setActiveTemplateImage] = useState<string | null>(null);
  
  // Dynamic measurement fields
  const [measurementFields, setMeasurementFields] = useState<{ key: string; value: string }[]>([
    { key: 'Neck', value: '' },
    { key: 'Chest', value: '' },
    { key: 'Waist', value: '' },
    { key: 'Shoulder', value: '' },
    { key: 'Sleeve', value: '' },
    { key: 'Length', value: '' },
  ]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: customers = [] } = useCustomers();
  const { data: itemTypes = [] } = useItemTypes();
  const { data: measurement, isLoading } = useMeasurement(id || '');
  const createMeasurementMutation = useCreateMeasurement();
  const updateMeasurementMutation = useUpdateMeasurement();

  useEffect(() => {
    if (measurement) {
      setCustomer(measurement.customer._id);
      setItem(measurement.item);
      setNotes(measurement.notes || '');
      setMoreDetails(measurement.moreDetails || '');
      
      if (measurement.values) {
        const fields = Object.entries(measurement.values).map(([key, value]) => ({ key, value: String(value) }));
        if (fields.length > 0) {
          setMeasurementFields(fields);
        }
      }
    }
  }, [measurement]);

  // Sync image when item or itemTypes change (e.g. on load)
  useEffect(() => {
    if (item && itemTypes.length > 0) {
      const matchedType = itemTypes.find(t => t.name === item);
      if (matchedType && matchedType.image !== activeTemplateImage) {
        setActiveTemplateImage(matchedType.image || null);
      }
    }
  }, [item, itemTypes, activeTemplateImage]);

  const handleFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...measurementFields];
    newFields[index][field] = value;
    setMeasurementFields(newFields);
  };

  const addField = () => {
    setMeasurementFields([...measurementFields, { key: '', value: '' }]);
  };

  const removeField = (index: number) => {
    const newFields = measurementFields.filter((_, i) => i !== index);
    setMeasurementFields(newFields);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Convert array back to map/object
    const values: Record<string, string> = {};
    measurementFields.forEach(field => {
      if (field.key && field.value) {
        values[field.key] = field.value;
      }
    });

    try {
      const measurementData = {
        customer,
        item,
        values,
        notes,
        moreDetails,
      };

      if (isEditMode) {
        await updateMeasurementMutation.mutateAsync({ id: id!, data: measurementData });
        toast.success('Measurement updated successfully');
      } else {
        await createMeasurementMutation.mutateAsync(measurementData);
        toast.success('Measurement created successfully');
      }
      navigate('/measurements');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving measurement');
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Layout title="Edit Measurement">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Preset templates for different items
  const applyTemplate = (templateName: string) => {
    setItem(templateName);
    const selectedType = itemTypes.find(t => t.name === templateName);
    
    if (selectedType) {
      setActiveTemplateImage(selectedType.image || null);
      if (selectedType.fields && selectedType.fields.length > 0) {
        const fields = selectedType.fields.map(field => ({ key: field, value: '' }));
        setMeasurementFields(fields);
      } else {
        setMeasurementFields([{ key: '', value: '' }]);
      }
    } else {
      setActiveTemplateImage(null);
      setMeasurementFields([{ key: '', value: '' }]);
    }
  };

  return (
    <Layout title={isEditMode ? 'Edit Measurement' : 'New Measurement'}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-8 transition-colors duration-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                  <select
                    required
                    title="Customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Type (Select Template)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {itemTypes.map((type) => (
                      <button
                        key={type._id}
                        type="button"
                        title={`Select ${type.name}`}
                        onClick={() => applyTemplate(type.name)}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${
                          item === type.name 
                            ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' 
                            : 'bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    title="Item Type"
                    value={item}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    placeholder="Select a template above"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Measurements</label>
                <div className="space-y-3">
                  {measurementFields.map((field, index) => (
                    <div 
                      key={index} 
                      className={`flex space-x-4 items-center p-2 rounded-lg transition-colors ${activeField === field.key ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}`}
                      onClick={() => setActiveField(field.key)}
                    >
                      <input
                        type="text"
                        placeholder="Label (e.g. Chest)"
                        title="Measurement Label"
                        value={field.key}
                        onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        title="Measurement Value"
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      />
                      <button
                        type="button"
                        title="Remove Field"
                        onClick={(e) => { e.stopPropagation(); removeField(index); }}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addField}
                  className="mt-3 flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Field
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  rows={3}
                  title="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Any specific requirements..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">More Details</label>
                <textarea
                  rows={3}
                  title="More Details"
                  value={moreDetails}
                  onChange={(e) => setMoreDetails(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder="Additional details..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/measurements')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMeasurementMutation.isPending || updateMeasurementMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createMeasurementMutation.isPending || updateMeasurementMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Measurement' : 'Save Measurement')}
                </button>
              </div>
            </form>
          </div>

          {/* Visual Guide Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <MeasurementGuide 
                activeField={activeField} 
                customImage={activeTemplateImage}
                onFieldSelect={(field) => {
                  setActiveField(field);
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MeasurementFormPage;
