import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText } from 'lucide-react';
import Layout from '../components/Layout';
// import { useAuth } from '../context/AuthContext';
import { Customer, Style, Material, Order } from '../types';
import CustomerSelector from '../components/orders/CustomerSelector';
import MaterialSelector, { MaterialUsed } from '../components/orders/MaterialSelector';
import MeasurementInputs from '../components/orders/MeasurementInputs';
import { useOrder, useCustomers, useStyles, useItemTypes, useMaterials } from '../hooks/useQueries';
import { useCreateOrder, useUpdateOrder } from '../hooks/useMutations';

interface ItemType {
  _id: string;
  name: string;
  fields: string[];
}

const OrderFormPage = () => {
  // const { userInfo: user } = useAuth();
  
  const { data: customers = [] } = useCustomers();
  const { data: styles = [] } = useStyles();
  const { data: itemTypes = [] } = useItemTypes();
  const { data: materials = [] } = useMaterials();

  const [customer, setCustomer] = useState('');
  const [style, setStyle] = useState('');
  const [fitOnDate, setFitOnDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [price, setPrice] = useState<string | number>('');
  const [discount, setDiscount] = useState<string | number>(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [measurementSnapshot, setMeasurementSnapshot] = useState<Record<string, string>>({});
  const [materialsUsed, setMaterialsUsed] = useState<MaterialUsed[]>([]);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: order, isLoading: isOrderLoading } = useOrder(id || '');
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  // Derive measurement fields from selected style and item types
  const getMeasurementFields = () => {
    if (!style || itemTypes.length === 0) return [];
    
    const selectedStyle = styles.find(s => s._id === style);
    if (!selectedStyle) return [];

    const category = selectedStyle.category || '';
    const matchedType = itemTypes.find(t => t.name.toLowerCase() === category.toLowerCase());
    
    return matchedType ? matchedType.fields : ['Notes'];
  };

  const measurementFields = getMeasurementFields();

  useEffect(() => {
    if (order) {
      setCustomer(order.customer._id);
      setStyle(order.style?._id || ''); // Handle optional style
      setFitOnDate(order.fitOnDate ? new Date(order.fitOnDate).toISOString().split('T')[0] : ''); // Safer date parsing
      setDeliveryDate(new Date(order.deliveryDate).toISOString().split('T')[0]);
      setPrice(order.price);
      setDiscount(order.discount || 0);
      setDescription(order.description || '');
      setStatus(order.status);
      if (order.measurementSnapshot) {
        setMeasurementSnapshot(order.measurementSnapshot);
      }
      if (order.materialsUsed) {
        setMaterialsUsed(order.materialsUsed.map((m: any) => ({
          material: m.material._id,
          quantity: m.quantity,
          name: m.material.name,
          unit: m.material.unit
        })));
      }
    }
  }, [order]);

  const handleMeasurementChange = (key: string, value: string) => {
    setMeasurementSnapshot(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Input Validation
    if (isNaN(Number(price)) || Number(price) < 0) {
      toast.error('Please enter a valid positive price');
      return;
    }
    if (isNaN(Number(discount)) || Number(discount) < 0) {
      toast.error('Discount cannot be negative');
      return;
    }

    try {
      const orderData = {
        customer,
        style,
        fitOnDate,
        deliveryDate,
        price,
        discount,
        description,
        status,
        measurementSnapshot,
        materialsUsed: materialsUsed.map(m => ({
          material: m.material,
          quantity: m.quantity
        }))
      };

      if (isEditMode) {
        await updateOrderMutation.mutateAsync({ id: id!, data: orderData });
        toast.success('Order updated successfully');
      } else {
        await createOrderMutation.mutateAsync(orderData);
        toast.success('Order created successfully');
      }
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving order');
    }
  };

  if (isEditMode && isOrderLoading) {
    return (
      <Layout title="Edit Order">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditMode ? 'Edit Order' : 'New Order'}>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerSelector 
              customers={customers} 
              selectedCustomerId={customer} 
              onChange={setCustomer} 
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Style</label>
              <select
                required
                title="Style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">Select Style</option>
                {styles.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</label>
              <input
                type="date"
                required
                title="Delivery Date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fit-on Date</label>
              <input
                type="date"
                title="Fit-on Date"
                value={fitOnDate}
                onChange={(e) => setFitOnDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
              <input
                type="number"
                required
                min="0"
                title="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</label>
              <input
                type="number"
                min="0"
                title="Discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={status}
                title="Status"
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <MaterialSelector 
            materials={materials} 
            materialsUsed={materialsUsed} 
            setMaterialsUsed={setMaterialsUsed} 
          />

          {style && (
            <MeasurementInputs 
              measurementFields={measurementFields} 
              measurementSnapshot={measurementSnapshot} 
              handleMeasurementChange={handleMeasurementChange} 
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              title="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate(`/orders/${id}/invoice`)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Invoice
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createOrderMutation.isPending || updateOrderMutation.isPending ? 'Saving...' : (isEditMode ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default OrderFormPage;
