import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CreditCard } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PaymentModal from '../components/PaymentModal';
import Skeleton from '../components/Skeleton';
import { useOrder, useCompanySettings } from '../hooks/useQueries';

const InvoicePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: order, isLoading: isLoadingOrder, refetch: refetchOrder } = useOrder(id!);
  const { data: company, isLoading: isLoadingCompany } = useCompanySettings();

  const loading = isLoadingOrder || isLoadingCompany;

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${id}`,
  });

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    refetchOrder(); // Refresh order to show paid status
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow space-y-6">
           <div className="flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
           </div>
           <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
           </div>
        </div>
      </div>
    );
  }
  if (!order) return <div className="text-center py-10">Order not found</div>;

  const subtotal = order.price;
  const discount = order.discount || 0;
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
          <div className="flex space-x-3">
            {order.paymentStatus !== 'Paid' && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                title="Pay Online"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Online
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </button>
          </div>
        </div>

        <div ref={componentRef} className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg print:shadow-none print:bg-white print:text-black relative transition-colors duration-200">
          {order.paymentStatus === 'Paid' && (
            <div className="absolute top-12 right-12 border-4 border-green-500 text-green-500 font-bold text-4xl px-4 py-2 transform rotate-12 opacity-50 pointer-events-none">
              PAID
            </div>
          )}
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
              <p className="text-gray-500">#{order._id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">{company?.name || 'Company Name'}</h2>
              <p className="text-gray-600">{company?.address}</p>
              <p className="text-gray-600">{company?.city}</p>
              <p className="text-gray-600">{company?.phone}</p>
              <p className="text-gray-600">{company?.email}</p>
            </div>
          </div>

          {/* Bill To & Details */}
          <div className="flex justify-between mb-12">
            <div>
              <h3 className="text-gray-500 font-semibold uppercase tracking-wider mb-4">Bill To</h3>
              <p className="font-bold text-gray-800 text-lg">{order.customer?.firstName} {order.customer?.lastName}</p>
              <p className="text-gray-600">{order.customer?.address}</p>
              <p className="text-gray-600">{order.customer?.phone}</p>
              <p className="text-gray-600">{order.customer?.email}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-gray-500 font-semibold mr-4">Date:</span>
                <span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500 font-semibold mr-4">Due Date:</span>
                <span className="text-gray-800">{new Date(order.deliveryDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold mr-4">Status:</span>
                <span className="uppercase font-bold text-gray-800">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 font-semibold text-gray-600 dark:text-gray-400">Description</th>
                <th className="text-right py-4 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                <th className="text-right py-4 font-semibold text-gray-600 dark:text-gray-400">Discount</th>
                <th className="text-right py-4 font-semibold text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4">
                  <p className="font-bold text-gray-800 dark:text-white">{order.style?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.description || 'Custom Tailoring Service'}</p>
                </td>
                <td className="text-right py-4 dark:text-gray-300">${subtotal.toFixed(2)}</td>
                <td className="text-right py-4 text-red-500 dark:text-red-400">-${discount.toFixed(2)}</td>
                <td className="text-right py-4 font-bold dark:text-white">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-semibold dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                <span className="text-red-500 dark:text-red-400">-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <span className="text-xl font-bold text-gray-800 dark:text-white">Total:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            <p className="mb-2">Thank you for your business!</p>
            <p>{company?.website}</p>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderId={order._id}
        amount={total}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default InvoicePage;
