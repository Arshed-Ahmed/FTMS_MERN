import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import { usePurchaseOrder } from '../hooks/useQueries';
import { useReceivePurchaseOrderItems } from '../hooks/useMutations';

const PurchaseOrderReceivePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receivedItems, setReceivedItems] = useState<Record<string, number>>({});

  const { data: po, isLoading } = usePurchaseOrder(id!);
  const receiveItemsMutation = useReceivePurchaseOrderItems();

  useEffect(() => {
    if (po) {
        const initialReceived: Record<string, number> = {};
        po.items.forEach((item: any) => {
            initialReceived[item._id] = 0;
        });
        setReceivedItems(initialReceived);
    }
  }, [po]);

  const handleQuantityChange = (itemId: string, value: string) => {
    setReceivedItems(prev => ({
      ...prev,
      [itemId]: Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format payload
    const itemsToReceive = [];
    for (const [itemId, qty] of Object.entries(receivedItems)) {
        if (qty > 0) {
            itemsToReceive.push({ itemId, receivedQuantity: qty });
        }
    }

    if (itemsToReceive.length === 0) {
        toast.error('Please enter received quantity for at least one item');
        return;
    }

    try {
      await receiveItemsMutation.mutateAsync({ id: id!, items: itemsToReceive });
      toast.success('Items received and stock updated successfully');
      navigate('/purchase-orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error receiving items');
    }
  };

  if (isLoading || !po) {
    return (
      <Layout title="Receive Items">
        <div className="max-w-4xl mx-auto space-y-6">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-2">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-2/3" />
              </div>
           </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Receive PO #${po.poNumber}`}>
      <div className="mb-6">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Purchase Orders
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Receive Items
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    PO #{po.poNumber} - {po.supplier?.name}
                </p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Order Date: {new Date(po.orderDate).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Status: <span className="text-indigo-600">{po.status}</span>
                </p>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ordered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Received So Far</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receive Now</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {po.items.map((item: any) => {
                    const remaining = item.quantity - item.receivedQuantity;
                    return (
                        <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            {item.material?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            {item.quantity} {item.material?.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            {item.receivedQuantity} {item.material?.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                            {remaining} {item.material?.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                            type="number"
                            title="Receive Quantity"
                            min="0"
                            max={remaining}
                            value={receivedItems[item._id] || 0}
                            onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            disabled={remaining === 0}
                            className="w-32 px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                            />
                        </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={receiveItemsMutation.isPending}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CheckCircle size={20} className="mr-2" />
              {receiveItemsMutation.isPending ? 'Processing...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PurchaseOrderReceivePage;
