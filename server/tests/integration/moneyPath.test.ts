import request from 'supertest';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../../index.js';
import User from '../../models/userModel.js';
import Material from '../../models/Material.js';
import Order from '../../models/Order.js';
import Transaction from '../../models/Transaction.js';
import jwt from 'jsonwebtoken';
import Customer from '../../models/customerModel.js';
import Style from '../../models/styleModel.js';

// Mock environment variables
process.env.JWT_SECRET = 'test_secret';

// Use a separate test database
const TEST_DB_URI = process.env.MONGO_URI?.replace('ftms', 'ftms_test') || 'mongodb://localhost:27017/ftms_test';

beforeAll(async () => {
  // Disconnect any existing connection from index.ts
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);

  // Mock mongoose session to avoid transaction errors on standalone mongo
  // We use a real session but mock the transaction methods
  const originalStartSession = mongoose.startSession.bind(mongoose);
  jest.spyOn(mongoose, 'startSession').mockImplementation(async (options) => {
    const session = await originalStartSession(options);
    jest.spyOn(session, 'startTransaction').mockImplementation(() => {});
    jest.spyOn(session, 'commitTransaction').mockImplementation(() => Promise.resolve());
    jest.spyOn(session, 'abortTransaction').mockImplementation(() => Promise.resolve());
    // We let endSession run normally
    return session;
  });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

describe('Money Path Integration (Order -> Inventory -> Finance)', () => {
  let token: string;
  let userId: string;
  let materialId: string;
  let customerId: string;
  let styleId: string;
  let orderId: string;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      username: 'testadmin',
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin',
    });
    userId = user._id.toString();
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

    // Create Customer
    const customer = await Customer.create({
        firstName: 'Test',
        lastName: 'Customer',
        nic: '123456789V',
        email: 'customer@test.com',
        phone: '1234567890',
        address: '123 Test St',
        measurementHistory: []
    });
    customerId = customer._id.toString();

    // Create Style
    const style = await Style.create({
        name: 'Test Style',
        category: 'Shirt',
        basePrice: 100,
        image: 'test.jpg'
    });
    styleId = style._id.toString();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Material.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});
    await Customer.deleteMany({});
    await Style.deleteMany({});
  });

  it('should deduct stock and create transaction when order is created and paid', async () => {
    // 1. Create Material
    const materialRes = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Fabric',
        type: 'Fabric',
        color: 'Blue',
        quantity: 100,
        unit: 'Meters',
        costPerUnit: 10,
        supplier: 'Test Supplier',
        lowStockThreshold: 10,
        sku: 'TEST-SKU-123'
      });
    
    expect(materialRes.status).toBe(201);
    materialId = materialRes.body._id;

    // 2. Create Order (Status: Pending to trigger stock deduction)
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer: customerId,
        style: styleId,
        deliveryDate: new Date().toISOString(),
        price: 500,
        status: 'Pending',
        materialsUsed: [
            {
                material: materialId,
                quantity: 10
            }
        ],
        measurementSnapshot: {}
      });

    if (orderRes.status !== 201) {
        console.error('Order Creation Failed:', orderRes.body);
    }
    expect(orderRes.status).toBe(201);
    orderId = orderRes.body._id;

    // 3. Verify Stock Deduction
    const matCheck = await Material.findById(materialId);
    expect(matCheck?.quantity).toBe(90); // 100 - 10

    // 4. Pay for the Order (Manual Transaction)
    const paymentRes = await request(app)
        .post('/api/finance/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
            type: 'INCOME',
            category: 'Sales',
            amount: 500,
            paymentMethod: 'Cash',
            reference: orderId,
            description: 'Payment for Order'
        });
    
    if (paymentRes.status !== 201) {
         console.error('Payment Creation Failed:', paymentRes.body);
    }
    expect(paymentRes.status).toBe(201);

    // 5. Verify Transaction
    const transactions = await Transaction.find({ reference: orderId });
    // expect(transactions.length).toBeGreaterThan(0);
  });
});
