import { Request, Response } from 'express';
import Stripe from 'stripe';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { logAudit } from '../services/auditService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Create Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Calculate amount in cents
  // Ensure price is a number and handle decimals
  const amount = Math.round((order.price - (order.discount || 0)) * 100);

  if (amount <= 0) {
    res.status(400);
    throw new Error('Invalid order amount');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd', // Change currency as needed
    metadata: { orderId: order._id.toString() },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Update Order to Paid
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { orderId, paymentIntentId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== 'succeeded') {
    res.status(400);
    throw new Error('Payment not successful');
  }

  order.paymentStatus = 'Paid';
  order.paymentMethod = 'Card (Online)';
  order.transactionId = paymentIntentId;
  
  const updatedOrder = await order.save();

  await logAudit({
    req,
    action: 'CONFIRM_PAYMENT',
    entity: 'Order',
    entityId: order._id,
    details: { paymentIntentId, amount: order.price - (order.discount || 0) },
  });

  if (req.user) {
    // Log Transaction in Ledger
    await Transaction.create({
      type: 'INCOME',
      category: 'Sales',
      amount: order.price - (order.discount || 0),
      reference: `Order #${order._id}`,
      description: `Online payment for Order #${order._id}`,
      paymentMethod: 'Card',
      date: Date.now(),
      recordedBy: req.user._id, // Note: req.user must be populated by auth middleware
    });
  }

  res.json(updatedOrder);
});

export { createPaymentIntent, confirmPayment };
