import api from './api';

export const paymentService = {
  createPaymentIntent: async (orderId: string) => {
    const response = await api.post('/payments/create-payment-intent', { orderId });
    return response.data;
  },

  confirmPayment: async (orderId: string, paymentIntentId: string) => {
    const response = await api.post('/payments/confirm', { orderId, paymentIntentId });
    return response.data;
  }
};
