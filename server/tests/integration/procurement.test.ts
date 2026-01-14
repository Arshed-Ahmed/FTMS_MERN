import request from 'supertest';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../../index.js';
import User from '../../models/userModel.js';
import Material from '../../models/Material.js';
import Supplier from '../../models/Supplier.js';
import PurchaseOrder from '../../models/PurchaseOrder.js';
import Transaction from '../../models/Transaction.js';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'test_secret';

// Use a separate test database
const TEST_DB_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ftms_test_procurement';

let token: string;
let userId: string;

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

beforeEach(async () => {
  // Clear collections
  await User.deleteMany({});
  await Material.deleteMany({});
  await Supplier.deleteMany({});
  await PurchaseOrder.deleteMany({});
  await Transaction.deleteMany({});

  // Create Test User
  const user = await User.create({
    username: 'procurement_admin',
    email: 'procurement@test.com',
    password: 'password123',
    role: 'Admin',
    nic: '987654321V'
  });
  userId = user._id.toString();
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
});

describe('Procurement Flow Integration (Supplier -> PO -> Inventory -> Finance)', () => {
  it('should increase stock and create expense when PO is received and paid', async () => {
    // 1. Create Supplier
    const supplierRes = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Supplier',
        email: 'supplier@test.com',
        phone: '0771234567',
        address: '123 Supplier St'
      });
    expect(supplierRes.status).toBe(201);
    const supplierId = supplierRes.body._id;

    // 2. Create Material (Initial Stock 0)
    const materialRes = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cotton Fabric',
        type: 'Fabric',
        color: 'White',
        quantity: 0,
        unit: 'Meters',
        costPerUnit: 500,
        supplier: supplierId,
        lowStockThreshold: 10
      });
    expect(materialRes.status).toBe(201);
    const materialId = materialRes.body._id;

    // 3. Create Purchase Order (Draft)
    const poRes = await request(app)
      .post('/api/purchase-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        supplier: supplierId,
        items: [
          {
            material: materialId,
            quantity: 100,
            unitCost: 500,
            total: 50000
          }
        ],
        totalAmount: 50000,
        expectedDate: new Date().toISOString(),
        notes: 'Urgent Order'
      });
    
    if (poRes.status !== 201) {
        console.error('PO Creation Failed:', poRes.body);
    }
    expect(poRes.status).toBe(201);
    const poId = poRes.body._id;

    // 4. Receive Purchase Order (Triggers Stock Increase)
    const receiveRes = await request(app)
      .put(`/api/purchase-orders/${poId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'Received'
      });

    if (receiveRes.status !== 200) {
        console.error('PO Receive Failed:', receiveRes.body);
    }
    expect(receiveRes.status).toBe(200);
    expect(receiveRes.body.status).toBe('Received');

    // 5. Verify Stock Increase
    const updatedMaterial = await Material.findById(materialId);
    expect(updatedMaterial?.quantity).toBe(100); // 0 + 100

    // 6. Pay Purchase Order (Triggers Expense Transaction)
    const payRes = await request(app)
      .put(`/api/purchase-orders/${poId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentMethod: 'Bank Transfer'
      });

    if (payRes.status !== 200) {
        console.error('PO Payment Failed:', payRes.body);
    }
    expect(payRes.status).toBe(200);
    expect(payRes.body.paymentStatus).toBe('Paid');

    // 7. Verify Expense Transaction
    const transactions = await Transaction.find({ reference: `PO #${poId}` });
    expect(transactions.length).toBe(1);
    expect(transactions[0].type).toBe('EXPENSE');
    expect(transactions[0].amount).toBe(50000); // 100 * 500
  });
});
