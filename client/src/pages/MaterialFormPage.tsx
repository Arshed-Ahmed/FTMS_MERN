import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Printer } from 'lucide-react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import Layout from '../components/Layout';
import { Material } from '../types';
import { useMaterial } from '../hooks/useQueries';
import { useCreateMaterial, useUpdateMaterial } from '../hooks/useMutations';

const MaterialFormPage = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Fabric');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('Meters');
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const componentRef = useRef<HTMLDivElement>(null);

  const { data: material, isLoading } = useMaterial(id || '');
  const createMaterialMutation = useCreateMaterial();
  const updateMaterialMutation = useUpdateMaterial();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    if (material) {
      setName(material.name);
      setType(material.type);
      setColor(material.color);
      setQuantity(material.quantity);
      setUnit(material.unit);
      setCostPerUnit(material.costPerUnit);
      setSupplier(material.supplier);
      setLowStockThreshold(material.lowStockThreshold);
      setDescription(material.description);
      setSku(material.sku || '');
    }
  }, [material]);

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    
    // Input Validation
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }
    if (isNaN(costPerUnit) || costPerUnit < 0) {
      toast.error('Please enter a valid positive cost');
      return;
    }
    if (isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      toast.error('Please enter a valid positive threshold');
      return;
    }

    try {
      const payload = {
        name,
        type,
        color,
        quantity,
        unit,
        costPerUnit,
        supplier,
        lowStockThreshold,
        description,
        sku,
      };

      if (isEditMode) {
        await updateMaterialMutation.mutateAsync({ id: id!, data: payload });
        toast.success('Material updated successfully');
      } else {
        await createMaterialMutation.mutateAsync(payload);
        toast.success('Material created successfully');
      }
      navigate('/materials');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving material');
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Layout title="Edit Material">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Material' : 'Add Material'}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/materials')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </button>

        <div className={`grid grid-cols-1 ${isEditMode && sku ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-3xl mx-auto'} gap-6`}>
          <div className={`${isEditMode && sku ? 'lg:col-span-2' : ''} bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200`}>
            <form onSubmit={submitHandler}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material Name
                  </label>
                  <input
                    type="text"
                    title="Material Name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    title="Type"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Fabric">Fabric</option>
                    <option value="Button">Button</option>
                    <option value="Thread">Thread</option>
                    <option value="Zipper">Zipper</option>
                    <option value="Lining">Lining</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    title="Color"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    title="Supplier"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    title="Quantity"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    title="Unit"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="Meters">Meters</option>
                    <option value="Yards">Yards</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Spools">Spools</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost Per Unit
                  </label>
                  <input
                    type="number"
                    title="Cost Per Unit"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    title="Low Stock Threshold"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU / Barcode
                  </label>
                  <input
                    type="text"
                    title="SKU / Barcode"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  title="Description"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <button
                  type="submit"
                  disabled={createMaterialMutation.isPending || updateMaterialMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {createMaterialMutation.isPending || updateMaterialMutation.isPending ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>

          {/* Barcode Section */}
          {isEditMode && sku && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-fit transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Barcode Label</h3>
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex flex-col items-center justify-center mb-4 bg-white">
                <div ref={componentRef} className="flex flex-col items-center p-4 bg-white text-black">
                  <h4 className="font-bold text-lg">{name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{type} - {color}</p>
                  <Barcode value={sku} width={1.5} height={50} fontSize={14} lineColor="#000000" background="#ffffff" />
                  <p className="text-xs mt-1">{sku}</p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="w-full bg-gray-800 dark:bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Label
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MaterialFormPage;
