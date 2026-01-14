import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';

describe('Order API', () => {
  // Close DB connection after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 401 if not authorized', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toEqual(401);
  });
});
