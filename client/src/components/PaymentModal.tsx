import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { useCreatePaymentIntent, useConfirmPayment } from '../hooks/useQueries';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ orderId, onSuccess }: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const confirmPaymentMutation = useConfirmPayment();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/orders/${orderId}/invoice`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An error occurred');
      toast.error(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await confirmPaymentMutation.mutateAsync({ 
          orderId, 
          paymentIntentId: paymentIntent.id 
        });
        toast.success('Payment successful!');
        onSuccess();
      } catch (error) {
        console.error(error);
        toast.error('Payment succeeded but failed to update order status.');
      }
    } else {
      setMessage('Unexpected state');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm">{message}</div>}
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        title="Pay Now"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, orderId, amount, onSuccess }: any) => {
  const [clientSecret, setClientSecret] = useState('');
  const { theme } = useTheme();
  const createPaymentIntentMutation = useCreatePaymentIntent();

  useEffect(() => {
    if (isOpen && orderId) {
      createPaymentIntentMutation.mutateAsync(orderId)
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => {
            console.error(err);
            toast.error('Failed to initialize payment');
            onClose();
        });
    }
  }, [isOpen, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const appearance = {
    theme: theme === 'dark' ? 'night' : 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative transition-colors duration-200">
        <button
          onClick={onClose}
          title="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Pay Invoice</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Total Amount: <span className="font-bold text-blue-600 dark:text-blue-400">${amount.toFixed(2)}</span></p>

        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm orderId={orderId} onSuccess={onSuccess} />
          </Elements>
        ) : (
          <div className="space-y-4 py-4">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-10 w-full mt-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
