import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel.js';
import Employee from '../models/employeeModel.js';
import Order from '../models/Order.js';
import Measurement from '../models/Measurement.js';
import Style from '../models/styleModel.js';
import Job from '../models/Job.js';
import Material from '../models/Material.js';
import ItemType from '../models/itemTypeModel.js';
// @desc    Empty all trash
// @route   DELETE /api/trash
// @access  Private/Admin
const emptyTrash = asyncHandler(async (req, res) => {
    // For Orders, we might need to handle stock reversion if we were doing soft delete -> hard delete logic
    // But forceDelete in orderController handles stock reversion.
    // If we just deleteMany, we skip the controller logic.
    // However, soft deleted orders (display: 1) are already "gone" from the system's perspective.
    // If we want to be 100% correct, we should iterate and call the logic, or just assume that if it's in trash, 
    // the stock implications were handled (or not).
    // In `orderController.js`, `deleteOrder` (soft delete) does NOT revert stock.
    // `forceDeleteOrder` DOES revert stock.
    // So if we just `deleteMany`, we lose the stock reversion logic.
    // To be safe, let's fetch the trashed orders and revert stock before deleting.
    const trashedOrders = await Order.find({ display: 1 });
    for (const order of trashedOrders) {
        if (order.materialsUsed && order.materialsUsed.length > 0) {
            for (const item of order.materialsUsed) {
                const material = await Material.findById(item.material);
                if (material) {
                    material.quantity += item.quantity;
                    await material.save();
                }
            }
        }
    }
    await Promise.all([
        Customer.deleteMany({ display: 1 }),
        Employee.deleteMany({ display: 1 }),
        Order.deleteMany({ display: 1 }),
        Measurement.deleteMany({ display: 1 }),
        Style.deleteMany({ display: 1 }),
        Job.deleteMany({ display: 1 }),
        Material.deleteMany({ display: 1 }),
        ItemType.deleteMany({ display: 1 }),
    ]);
    res.json({ message: 'Trash emptied successfully' });
});
export { emptyTrash };
