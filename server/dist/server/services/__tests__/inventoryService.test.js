import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
// Define mocks before imports
const mockMaterialModel = {
    findById: jest.fn(),
};
const mockStockMovementModel = {
    create: jest.fn(),
};
jest.unstable_mockModule('../../models/Material', () => ({
    default: mockMaterialModel,
}));
jest.unstable_mockModule('../../models/StockMovement', () => ({
    default: mockStockMovementModel,
}));
// Dynamic imports
const { deductStockForOrder, revertStockForOrder } = await import('../inventoryService.js');
const { default: Material } = await import('../../models/Material.js');
const { default: StockMovement } = await import('../../models/StockMovement.js');
describe('Inventory Service', () => {
    let session;
    const orderId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const materialId = new mongoose.Types.ObjectId();
    beforeEach(() => {
        jest.clearAllMocks();
        session = {}; // Mock session object
    });
    describe('deductStockForOrder', () => {
        it('should deduct stock successfully', async () => {
            const materialsUsed = [{ material: materialId, quantity: 5 }];
            const mockMaterial = {
                _id: materialId,
                name: 'Fabric',
                quantity: 10,
                save: jest.fn(),
            };
            // Mock chainable .session()
            const mockSessionFn = jest.fn().mockResolvedValue(mockMaterial);
            Material.findById.mockReturnValue({
                session: mockSessionFn,
            });
            await deductStockForOrder(materialsUsed, orderId, userId, session);
            expect(Material.findById).toHaveBeenCalledWith(materialId);
            expect(mockMaterial.quantity).toBe(5);
            expect(mockMaterial.save).toHaveBeenCalledWith({ session });
            expect(StockMovement.create).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({
                    type: 'OUT',
                    quantity: 5,
                    reason: 'Order Creation',
                }),
            ]), { session });
        });
        it('should throw error if material not found', async () => {
            const materialsUsed = [{ material: materialId, quantity: 5 }];
            const mockSessionFn = jest.fn().mockResolvedValue(null);
            Material.findById.mockReturnValue({
                session: mockSessionFn,
            });
            await expect(deductStockForOrder(materialsUsed, orderId, userId, session)).rejects.toThrow(`Material not found: ${materialId}`);
        });
        it('should throw error if insufficient stock', async () => {
            const materialsUsed = [{ material: materialId, quantity: 15 }];
            const mockMaterial = {
                _id: materialId,
                name: 'Fabric',
                quantity: 10,
                save: jest.fn(),
            };
            const mockSessionFn = jest.fn().mockResolvedValue(mockMaterial);
            Material.findById.mockReturnValue({
                session: mockSessionFn,
            });
            await expect(deductStockForOrder(materialsUsed, orderId, userId, session)).rejects.toThrow('Insufficient stock for material: Fabric');
        });
    });
    describe('revertStockForOrder', () => {
        it('should revert stock successfully', async () => {
            const materialsUsed = [{ material: materialId, quantity: 5 }];
            const mockMaterial = {
                _id: materialId,
                name: 'Fabric',
                quantity: 10,
                save: jest.fn(),
            };
            const mockSessionFn = jest.fn().mockResolvedValue(mockMaterial);
            Material.findById.mockReturnValue({
                session: mockSessionFn,
            });
            await revertStockForOrder(materialsUsed, orderId, userId, session);
            expect(mockMaterial.quantity).toBe(15);
            expect(mockMaterial.save).toHaveBeenCalledWith({ session });
            expect(StockMovement.create).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({
                    type: 'IN',
                    quantity: 5,
                    reason: 'Order Cancellation/Draft',
                }),
            ]), { session });
        });
    });
});
