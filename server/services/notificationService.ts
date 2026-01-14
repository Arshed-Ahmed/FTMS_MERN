import nodemailer from 'nodemailer';
import twilio from 'twilio';
import User from '../models/userModel.js';
import { ICustomer } from '../models/customerModel.js';
import { IOrder } from '../models/Order.js';
import { IMaterial } from '../models/Material.js';

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

// Configure Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!to) {
    console.log('No recipient email provided for notification.');
    return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('--- MOCK EMAIL SEND ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('-----------------------');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendSMS = async (to: string, body: string) => {
  if (!to) {
    console.log('No recipient phone provided for SMS notification.');
    return;
  }

  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('--- MOCK SMS SEND ---');
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log('---------------------');
    return;
  }

  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

export const notifyOrderCreated = async (customer: ICustomer, order: IOrder) => {
  // Email
  const subject = `Order Confirmation: #${order._id.toString().slice(-6)}`;
  const text = `Dear ${customer.firstName},\n\nThank you for your order!\n\nOrder ID: ${order._id}\nDescription: ${order.description || 'Tailoring Service'}\nTotal Amount: $${order.price}\nDelivery Date: ${new Date(order.deliveryDate).toDateString()}\n\nWe will notify you when it is ready.`;
  await sendEmail(customer.email, subject, text);

  // SMS
  const smsBody = `Thanks for your order #${order._id.toString().slice(-6)}! Total: $${order.price}. Due: ${new Date(order.deliveryDate).toLocaleDateString()}.`;
  await sendSMS(customer.phone, smsBody);
};

export const notifyOrderStatusChange = async (customer: ICustomer, order: IOrder, newStatus: string) => {
  // Email
  const subject = `Order Update: #${order._id.toString().slice(-6)} is ${newStatus}`;
  const text = `Dear ${customer.firstName},\n\nThe status of your order #${order._id.toString().slice(-6)} has been updated to: ${newStatus}.\n\nDescription: ${order.description || 'Tailoring Service'}\n\nThank you for choosing us!`;
  await sendEmail(customer.email, subject, text);

  // SMS
  const smsBody = `Order #${order._id.toString().slice(-6)} update: Status is now ${newStatus}.`;
  await sendSMS(customer.phone, smsBody);
};

export const notifyOrderReady = async (customer: ICustomer, order: IOrder) => {
  // Email
  const subject = `Your Order #${order._id.toString().slice(-6)} is Ready!`;
  const text = `Dear ${customer.firstName},\n\nYour order for ${order.description || 'Tailoring Service'} is now ready for pickup.\n\nTotal Amount: $${order.price}\n\nThank you for choosing us!`;
  await sendEmail(customer.email, subject, text);

  // SMS
  const smsBody = `Hi ${customer.firstName}, your order #${order._id.toString().slice(-6)} is ready for pickup! Total: $${order.price}.`;
  await sendSMS(customer.phone, smsBody);
};

export const notifyJobAssigned = async (tailorId: string, order: IOrder) => {
  const tailor = await User.findById(tailorId);
  if (!tailor) return;

  // Email
  if (tailor.email) {
    const subject = `New Job Assigned: Order #${order._id.toString().slice(-6)}`;
    const text = `Hello ${tailor.username},\n\nYou have been assigned a new job.\n\nOrder ID: ${order._id}\nDelivery Date: ${new Date(order.deliveryDate).toDateString()}\n\nPlease check the dashboard for details.`;
    await sendEmail(tailor.email, subject, text);
  }

  // SMS
  if (tailor.phone) {
    const smsBody = `New Job: Order #${order._id.toString().slice(-6)} assigned to you. Due: ${new Date(order.deliveryDate).toLocaleDateString()}.`;
    await sendSMS(tailor.phone, smsBody);
  }
};

export const notifyLowStock = async (material: IMaterial) => {
  // Find all admins
  const admins = await User.find({ role: 'Admin' });
  
  for (const admin of admins) {
    // Email
    if (admin.email) {
      const subject = `Low Stock Alert: ${material.name}`;
      const text = `Alert: The stock for ${material.name} has dropped below the threshold.\n\nCurrent Quantity: ${material.quantity} ${material.unit}\nThreshold: ${material.lowStockThreshold}\n\nPlease restock soon.`;
      await sendEmail(admin.email, subject, text);
    }

    // SMS
    if (admin.phone) {
      const smsBody = `Low Stock Alert: ${material.name} is low (${material.quantity} ${material.unit}). Threshold: ${material.lowStockThreshold}.`;
      await sendSMS(admin.phone, smsBody);
    }
  }
};
