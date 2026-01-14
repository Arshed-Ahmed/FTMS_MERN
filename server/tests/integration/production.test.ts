import request from 'supertest';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../../index.js';
import User from '../../models/userModel.js';
import Employee from '../../models/employeeModel.js';
import Job from '../../models/Job.js';
import Order from '../../models/Order.js';
import Customer from '../../models/customerModel.js';
import Style from '../../models/styleModel.js';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'test_secret';

// Use a separate test database
const TEST_DB_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ftms_test_production';

let token: string;
let userId: string;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(TEST_DB_URI);

  // Mock mongoose session to avoid transaction errors on standalone mongo
  const originalStartSession = mongoose.startSession.bind(mongoose);
  jest.spyOn(mongoose, 'startSession').mockImplementation(async (options) => {
    const session = await originalStartSession(options);
    jest.spyOn(session, 'startTransaction').mockImplementation(() => {});
    jest.spyOn(session, 'commitTransaction').mockImplementation(() => Promise.resolve());
    jest.spyOn(session, 'abortTransaction').mockImplementation(() => Promise.resolve());
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
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Job.deleteMany({});
  await Order.deleteMany({});
  await Customer.deleteMany({});
  await Style.deleteMany({});

  const user = await User.create({
    username: 'production_admin',
    email: 'production@test.com',
    password: 'password123',
    role: 'Admin',
    nic: '111111111V'
  });
  userId = user._id.toString();
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
});

describe('Production Flow Integration (Job Assignment -> Completion)', () => {
  it('should assign a job to an employee and track its completion', async () => {
    // 1. Create Employee (Tailor)
    const empRes = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'John',
        lastName: 'Tailor',
        nic: '999999999V',
        email: 'tailor@test.com',
        phone: '0771112222',
        address: 'Tailor St',
        category: 'Tailor',
        startDate: new Date().toISOString(),
        salary: 50000,
        status: 'Active'
      });
    expect(empRes.status).toBe(201);
    const employeeId = empRes.body._id;

    // 2. Create Prerequisites (Customer, Style, Order)
    const custRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Job', lastName: 'Customer', nic: '888888888V', phone: '0773334444', email: 'job@test.com', address: 'Job St', gender: 'Male' });
    const customerId = custRes.body._id;

    const styleRes = await request(app)
      .post('/api/styles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Job Suit',
        code: 'JS001',
        category: 'Suit',
        basePrice: 5000,
        image: 'test.jpg'
      });
    
    if (styleRes.status !== 201) {
        console.error('Style Creation Failed:', styleRes.body);
    }
    expect(styleRes.status).toBe(201);
    const styleId = styleRes.body._id;

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ customer: customerId, style: styleId, price: 5000, status: 'Pending', deliveryDate: new Date().toISOString() });
    
    if (orderRes.status !== 201) {
        console.error('Order Creation Failed:', orderRes.body);
    }
    expect(orderRes.status).toBe(201);
    const orderId = orderRes.body._id;

    // 3. Create Job (Assign Order to Employee)
    const jobRes = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order: orderId.toString(),
        employee: employeeId.toString(),
        details: 'Stitch the suit',
        assignedDate: new Date().toISOString(),
        deadline: new Date().toISOString(),
        status: 'Pending'
      });
    
    if (jobRes.status !== 201) {
        console.error('Job Creation Failed:', jobRes.body);
    }
    expect(jobRes.status).toBe(201);
    const jobId = jobRes.body._id;

    // 4. Update Job Status to In Progress
    const progressRes = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'In Progress'
      });
    expect(progressRes.status).toBe(200);
    expect(progressRes.body.status).toBe('In Progress');

    // 5. Complete Job
    const completeRes = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'Completed'
      });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe('Completed');

    // 6. Verify Employee Job History (Optional - if implemented)
    // This would check if the job shows up in the employee's history or if stats are updated
  });
});
