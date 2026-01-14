import mongoose, { ClientSession } from 'mongoose';
import Material from '../models/Material.js';
import StockMovement from '../models/StockMovement.js';
import { IMaterialUsed } from '../models/Order.js';

export const deductStockForOrder = async (
  materialsUsed: IMaterialUsed[],
  orderId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  session: ClientSession
) => {
  if (materialsUsed && materialsUsed.length > 0) {
    for (const item of materialsUsed) {
      const material = await Material.findById(item.material).session(session);
      if (!material) {
        throw new Error(`Material not found: ${item.material}`);
      }
      if (material.quantity < item.quantity) {
        throw new Error(`Insufficient stock for material: ${material.name}`);
      }
      material.quantity -= item.quantity;
      await material.save({ session });

      // Create Stock Movement Log
      await StockMovement.create([{
        material: item.material,
        type: 'OUT',
        quantity: item.quantity,
        reason: 'Order Creation',
        reference: `Order #${orderId}`,
        performedBy: userId,
        date: Date.now()
      }], { session });
    }
  }
};

export const revertStockForOrder = async (
  materialsUsed: IMaterialUsed[],
  orderId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  session: ClientSession
) => {
  if (materialsUsed && materialsUsed.length > 0) {
    for (const item of materialsUsed) {
      const material = await Material.findById(item.material).session(session);
      if (material) {
        material.quantity += item.quantity;
        await material.save({ session });

        // Create Stock Movement Log
        await StockMovement.create([{
          material: item.material,
          type: 'IN',
          quantity: item.quantity,
          reason: 'Order Cancellation/Draft',
          reference: `Order #${orderId}`,
          performedBy: userId,
          date: Date.now()
        }], { session });
      }
    }
  }
};
