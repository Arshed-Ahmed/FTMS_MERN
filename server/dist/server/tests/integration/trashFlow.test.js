import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../index.js';
import User from '../../models/userModel.js';
import Customer from '../../models/customerModel.js';
import jwt from 'jsonwebtoken';
// Mock environment variables
process.env.JWT_SECRET = 'test_secret';
// Use a separate test database
const TEST_DB_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ftms_test_trash';
let token;
let userId;
beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI);
});
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
});
beforeEach(async () => {
    await User.deleteMany({});
    await Customer.deleteMany({});
    const user = await User.create({
        username: 'trash_admin',
        email: 'trash@test.com',
        password: 'password123',
        role: 'Admin',
        nic: '123456789V'
    });
    userId = user._id.toString();
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
});
describe('Trash Flow Integration (Soft Delete -> Restore)', () => {
    it('should soft delete a customer and then restore it', async () => {
        // 1. Create Customer
        const createRes = await request(app)
            .post('/api/customers')
            .set('Authorization', `Bearer ${token}`)
            .send({
            firstName: 'Trash',
            lastName: 'Test',
            nic: '123456789V',
            email: 'trashcustomer@test.com',
            phone: '0779999999',
            address: 'Trash St',
            gender: 'Male'
        });
        expect(createRes.status).toBe(201);
        const customerId = createRes.body._id;
        // 2. Soft Delete Customer
        const deleteRes = await request(app)
            .delete(`/api/customers/${customerId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(deleteRes.status).toBe(200);
        // 3. Verify NOT in main list
        const listRes = await request(app)
            .get('/api/customers')
            .set('Authorization', `Bearer ${token}`);
        const foundInList = listRes.body.find((c) => c._id === customerId);
        expect(foundInList).toBeUndefined();
        // 4. Verify IN trash list
        // Note: Assuming there is a generic trash endpoint or specific customer trash endpoint
        // Based on previous context, we added trash routes. Let's check /api/customers/trash first
        // If that fails, we might need to check the generic /api/trash/customers
        // Let's try the specific route first as it's common pattern
        const trashRes = await request(app)
            .get('/api/customers/trash')
            .set('Authorization', `Bearer ${token}`);
        // If 404, it might be under /api/trash/customers. 
        // But let's assume standard pattern first.
        if (trashRes.status === 404) {
            // Fallback to generic trash route if implemented
            // For now, let's assert 200 and see if it fails
        }
        expect(trashRes.status).toBe(200);
        const foundInTrash = trashRes.body.find((c) => c._id === customerId);
        expect(foundInTrash).toBeDefined();
        // 5. Restore Customer
        const restoreRes = await request(app)
            .put(`/api/customers/${customerId}/restore`)
            .set('Authorization', `Bearer ${token}`);
        expect(restoreRes.status).toBe(200);
        // 6. Verify BACK in main list
        const listRes2 = await request(app)
            .get('/api/customers')
            .set('Authorization', `Bearer ${token}`);
        const foundInList2 = listRes2.body.find((c) => c._id === customerId);
        expect(foundInList2).toBeDefined();
    });
});
