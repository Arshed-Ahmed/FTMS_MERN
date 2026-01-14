import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Material from '../models/Material.js';
import StockMovement from '../models/StockMovement.js';
import Transaction from '../models/Transaction.js';
import { logAudit } from '../services/auditService.js';
// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = asyncHandler(async (req, res) => {
    const orders = await PurchaseOrder.find({ isDeleted: false })
        .populate('supplier', 'name')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });
    res.json(orders);
});
// @desc    Get purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = asyncHandler(async (req, res) => {
    const order = await PurchaseOrder.findById(req.params.id)
        .populate('supplier', 'name email phone address')
        .populate('items.material', 'name unit')
        .populate('createdBy', 'username');
    if (order) {
        res.json(order);
    }
    else {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
});
// @desc    Create a purchase order
// @route   POST /api/purchase-orders
// @access  Private
const createPurchaseOrder = asyncHandler(async (req, res) => {
    const { supplier, items, expectedDate, notes } = req.body;
    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items in purchase order');
    }
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    // Calculate totals
    let totalAmount = 0;
    const processedItems = items.map((item) => {
        const total = item.quantity * item.unitCost;
        totalAmount += total;
        return {
            ...item,
            total
        };
    });
    const purchaseOrder = new PurchaseOrder({
        supplier,
        items: processedItems,
        totalAmount,
        expectedDate,
        notes,
        createdBy: req.user._id,
        status: 'Draft'
    });
    const createdOrder = await purchaseOrder.save();
    await logAudit({
        req,
        action: 'CREATE_PO',
        entity: 'PurchaseOrder',
        entityId: createdOrder._id,
        details: { supplier, totalAmount },
    });
    res.status(201).json(createdOrder);
});
// @desc    Update purchase order status
// @route   PUT /api/purchase-orders/:id/status
// @access  Private
const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
    if (order.status === 'Received') {
        res.status(400);
        throw new Error('Cannot change status of received order');
    }
    // If receiving the order, we need to update stock
    if (status === 'Received') {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // 1. Update Order Status
            order.status = 'Received';
            order.receivedDate = new Date();
            await order.save({ session });
            // 2. Update Stock and Log Movements
            for (const item of order.items) {
                const material = await Material.findById(item.material).session(session);
                if (material) {
                    material.quantity += item.quantity;
                    // Optionally update cost per unit to latest price or weighted average
                    // material.costPerUnit = item.unitCost; 
                    await material.save({ session });
                    if (req.user) {
                        await StockMovement.create([{
                                material: item.material,
                                type: 'IN',
                                quantity: item.quantity,
                                reason: 'Purchase Order Received',
                                reference: `PO #${order._id}`,
                                performedBy: req.user._id,
                                date: Date.now()
                            }], { session });
                    }
                }
            }
            await session.commitTransaction();
            session.endSession();
            await logAudit({
                req,
                action: 'RECEIVE_PO',
                entity: 'PurchaseOrder',
                entityId: order._id,
                details: { status: 'Received' },
            });
            res.json(order);
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            res.status(500);
            throw new Error('Transaction failed: ' + error.message);
        }
    }
    else {
        // Just update status (e.g. Draft -> Ordered)
        order.status = status;
        const updatedOrder = await order.save();
        await logAudit({
            req,
            action: 'UPDATE_PO_STATUS',
            entity: 'PurchaseOrder',
            entityId: order._id,
            details: { status },
        });
        res.json(updatedOrder);
    }
});
// @desc    Mark purchase order as paid
// @route   PUT /api/purchase-orders/:id/pay
// @access  Private
const payPurchaseOrder = asyncHandler(async (req, res) => {
    const { paymentMethod } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
    if (order.paymentStatus === 'Paid') {
        res.status(400);
        throw new Error('Order is already paid');
    }
    order.paymentStatus = 'Paid';
    await order.save();
    await logAudit({
        req,
        action: 'PAY_PO',
        entity: 'PurchaseOrder',
        entityId: order._id,
        details: { paymentMethod, amount: order.totalAmount },
    });
    if (req.user) {
        // Log Expense in Ledger
        await Transaction.create({
            type: 'EXPENSE',
            category: 'Procurement',
            amount: order.totalAmount,
            reference: `PO #${order._id}`,
            description: `Payment for Purchase Order #${order._id}`,
            paymentMethod: paymentMethod || 'Bank Transfer',
            date: Date.now(),
            recordedBy: req.user._id,
        });
    }
    res.json(order);
});
// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private
const deletePurchaseOrder = asyncHandler(async (req, res) => {
    const order = await PurchaseOrder.findById(req.params.id);
    if (order) {
        if (order.status === 'Received') {
            res.status(400);
            throw new Error('Cannot delete a received purchase order');
        }
        await order.softDelete();
        await logAudit({
            req,
            action: 'DELETE_PO',
            entity: 'PurchaseOrder',
            entityId: order._id,
        });
        res.json({ message: 'Purchase Order removed' });
    }
    else {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
});
// @desc    Get trashed purchase orders
// @route   GET /api/purchase-orders/trash
// @access  Private
const getTrashedPurchaseOrders = asyncHandler(async (req, res) => {
    const orders = await PurchaseOrder.find({ isDeleted: true })
        .populate('supplier', 'name')
        .populate('createdBy', 'username')
        .sort({ updatedAt: -1 });
    res.json(orders);
});
// @desc    Restore purchase order
// @route   PUT /api/purchase-orders/:id/restore
// @access  Private
const restorePurchaseOrder = asyncHandler(async (req, res) => {
    const order = await PurchaseOrder.findById(req.params.id);
    if (order) {
        await order.restore();
        await logAudit({
            req,
            action: 'RESTORE_PO',
            entity: 'PurchaseOrder',
            entityId: order._id,
        });
        res.json({ message: 'Purchase Order restored' });
    }
    else {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
});
// @desc    Force delete purchase order
// @route   DELETE /api/purchase-orders/:id/force
// @access  Private
const forceDeletePurchaseOrder = asyncHandler(async (req, res) => {
    const order = await PurchaseOrder.findById(req.params.id);
    if (order) {
        await order.deleteOne();
        await logAudit({
            req,
            action: 'FORCE_DELETE_PO',
            entity: 'PurchaseOrder',
            entityId: order._id,
        });
        res.json({ message: 'Purchase Order permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Purchase Order not found');
    }
});
export { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus, payPurchaseOrder, deletePurchaseOrder, getTrashedPurchaseOrders, restorePurchaseOrder, forceDeletePurchaseOrder, };
