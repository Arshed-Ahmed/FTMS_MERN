import Order from '../models/Order.js';
import Customer from '../models/customerModel.js';
import Employee from '../models/employeeModel.js';
import Material from '../models/Material.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Transaction from '../models/Transaction.js';
// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        let query = { isDeleted: false };
        const totalOrders = await Order.countDocuments(query);
        const totalCustomers = await Customer.countDocuments({ isDeleted: false });
        const totalEmployees = await Employee.countDocuments({ isDeleted: false });
        const pendingOrders = await Order.countDocuments({ ...query, status: 'Pending' });
        // Calculate revenue (sum of price in all orders)
        const revenueAgg = await Order.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);
        const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
        // New ERP Stats
        const lowStockCount = await Material.countDocuments({ quantity: { $lt: 10 }, isDeleted: false }); // Threshold 10
        const pendingPO = await PurchaseOrder.countDocuments({ status: 'Ordered', isDeleted: false });
        // Financial Stats
        const incomeAgg = await Transaction.aggregate([
            { $match: { type: 'INCOME', isDeleted: false } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const expenseAgg = await Transaction.aggregate([
            { $match: { type: 'EXPENSE', isDeleted: false } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
        const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
        const netProfit = totalIncome - totalExpense;
        const ordersByStatus = await Order.aggregate([
            { $match: query },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const recentOrders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'firstName lastName');
        res.json({
            totalOrders,
            totalCustomers,
            totalEmployees,
            pendingOrders,
            revenue,
            lowStockCount,
            pendingPO,
            netProfit,
            ordersByStatus,
            recentOrders
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export { getDashboardStats };
