import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Material from '../models/Material.js';
import Customer from '../models/customerModel.js';
import { notifyOrderReady, notifyLowStock, notifyOrderCreated, notifyOrderStatusChange } from '../services/notificationService.js';
import { deductStockForOrder, revertStockForOrder } from '../services/inventoryService.js';
import Style from '../models/styleModel.js';
import ItemType from '../models/itemTypeModel.js';
import { logAudit } from '../services/auditService.js';
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    let query = {};
    // Filter out soft-deleted orders
    query.isDeleted = false;
    const orders = await Order.find(query)
        .populate('customer', 'name email phone')
        .populate('style', 'name image')
        .sort({ createdAt: -1 });
    res.json(orders);
});
// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('customer', 'name email phone')
        .populate('style', 'name image');
    if (order) {
        res.json(order);
    }
    else {
        res.status(404);
        throw new Error('Order not found');
    }
});
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { customer, style, fitOnDate, deliveryDate, price, discount, description, status, measurementSnapshot, materialsUsed, } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = new Order({
            customer,
            style,
            fitOnDate,
            deliveryDate,
            price,
            discount,
            description,
            status,
            measurementSnapshot,
            materialsUsed,
        });
        // Check material availability and deduct stock
        if (req.user && status !== 'Draft') {
            await deductStockForOrder(materialsUsed, order._id, req.user._id, session);
        }
        // Validate Measurements against Template
        if (style && measurementSnapshot) {
            const styleDoc = await Style.findById(style).session(session);
            if (styleDoc) {
                const itemType = await ItemType.findOne({ name: styleDoc.category }).session(session);
                if (itemType) {
                    const requiredFields = itemType.fields;
                    const providedFields = Object.keys(measurementSnapshot);
                    for (const key of providedFields) {
                        if (!requiredFields.includes(key) && key !== 'Notes') {
                            // Allow 'Notes' as a standard extra field
                            throw new Error(`Invalid measurement field: ${key}. Allowed fields: ${requiredFields.join(', ')}`);
                        }
                    }
                }
            }
        }
        const createdOrder = await order.save({ session });
        // Measurement History
        if (measurementSnapshot && Object.keys(measurementSnapshot).length > 0) {
            const customerDoc = await Customer.findById(customer).session(session);
            if (customerDoc) {
                customerDoc.measurementHistory.push({
                    orderId: createdOrder._id,
                    measurements: measurementSnapshot,
                    notes: description,
                    date: new Date()
                });
                await customerDoc.save({ session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        // Notifications (outside transaction)
        // Notify Customer of Order Creation
        if (status !== 'Draft') {
            const customerDoc = await Customer.findById(customer);
            if (customerDoc) {
                notifyOrderCreated(customerDoc, createdOrder);
            }
        }
        // Check Low Stock
        if (materialsUsed && materialsUsed.length > 0) {
            for (const item of materialsUsed) {
                const material = await Material.findById(item.material);
                if (material && material.quantity <= material.lowStockThreshold) {
                    notifyLowStock(material);
                }
            }
        }
        await logAudit({
            req,
            action: 'CREATE',
            entity: 'Order',
            entityId: createdOrder._id,
            details: { customer, style, price, status },
        });
        res.status(201).json(createdOrder);
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(error.message);
    }
});
// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
    const { customer, style, fitOnDate, deliveryDate, price, discount, description, status, measurementSnapshot, materialsUsed, } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(req.params.id).session(session);
        if (order) {
            const oldStatus = order.status;
            const newStatus = status || oldStatus;
            // Helper to check if status requires stock reservation
            const isStockReserved = (s) => s !== 'Draft' && s !== 'Cancelled';
            const wasReserved = isStockReserved(oldStatus);
            const willBeReserved = isStockReserved(newStatus);
            // Handle Stock Movements (Revert/Deduct)
            // Trigger if materials changed OR status changed in a way that affects stock
            if (materialsUsed || (wasReserved !== willBeReserved)) {
                const materialsToRevert = order.materialsUsed;
                const materialsToDeduct = materialsUsed || order.materialsUsed;
                // REVERT logic
                if (wasReserved) {
                    // Revert if materials are changing OR if we are moving to an unreserved state
                    if (materialsUsed || !willBeReserved) {
                        if (req.user) {
                            await revertStockForOrder(materialsToRevert, order._id, req.user._id, session);
                        }
                    }
                }
                // DEDUCT logic
                if (willBeReserved) {
                    // Deduct if materials are changing OR if we are moving from an unreserved state
                    if (materialsUsed || !wasReserved) {
                        if (req.user) {
                            await deductStockForOrder(materialsToDeduct, order._id, req.user._id, session);
                        }
                    }
                }
                if (materialsUsed) {
                    order.materialsUsed = materialsUsed;
                }
            }
            order.customer = customer || order.customer;
            order.style = style || order.style;
            order.fitOnDate = fitOnDate || order.fitOnDate;
            order.deliveryDate = deliveryDate || order.deliveryDate;
            order.price = price || order.price;
            order.discount = discount !== undefined ? discount : order.discount;
            order.description = description || order.description;
            order.status = newStatus;
            // Validate Measurements if they are being updated
            if (measurementSnapshot) {
                const styleId = style || order.style;
                if (styleId) {
                    const styleDoc = await Style.findById(styleId).session(session);
                    if (styleDoc) {
                        const itemType = await ItemType.findOne({ name: styleDoc.category }).session(session);
                        if (itemType) {
                            const requiredFields = itemType.fields;
                            const providedFields = Object.keys(measurementSnapshot);
                            for (const key of providedFields) {
                                if (!requiredFields.includes(key) && key !== 'Notes') {
                                    throw new Error(`Invalid measurement field: ${key}. Allowed fields: ${requiredFields.join(', ')}`);
                                }
                            }
                        }
                    }
                }
            }
            order.measurementSnapshot = measurementSnapshot || order.measurementSnapshot;
            const updatedOrder = await order.save({ session });
            // Measurement History
            if (measurementSnapshot && Object.keys(measurementSnapshot).length > 0) {
                const customerDoc = await Customer.findById(order.customer).session(session);
                if (customerDoc) {
                    const existingEntryIndex = customerDoc.measurementHistory.findIndex((h) => h.orderId?.toString() === order._id.toString());
                    if (existingEntryIndex !== -1) {
                        customerDoc.measurementHistory[existingEntryIndex].measurements = measurementSnapshot;
                        customerDoc.measurementHistory[existingEntryIndex].date = new Date();
                    }
                    else {
                        customerDoc.measurementHistory.push({
                            orderId: order._id,
                            measurements: measurementSnapshot,
                            notes: description,
                            date: new Date()
                        });
                    }
                    await customerDoc.save({ session });
                }
            }
            await session.commitTransaction();
            session.endSession();
            // Notifications (outside transaction)
            if (status && status !== oldStatus) {
                const customerDoc = await Customer.findById(order.customer);
                if (customerDoc) {
                    if (status === 'Ready') {
                        notifyOrderReady(customerDoc, updatedOrder);
                    }
                    else if (status !== 'Draft') {
                        // Notify for other significant status changes (e.g. Cutting, Stitching, Delivered)
                        // Avoid notifying for Draft -> Pending if we want to treat Pending as "Created" (handled above? No, updateOrder might be used to submit draft)
                        // If it was Draft and now is Pending, it's effectively "Created" for the customer
                        if (oldStatus === 'Draft' && status === 'Pending') {
                            notifyOrderCreated(customerDoc, updatedOrder);
                        }
                        else {
                            notifyOrderStatusChange(customerDoc, updatedOrder, status);
                        }
                    }
                }
            }
            // Check Low Stock (if materials changed)
            if (materialsUsed && materialsUsed.length > 0) {
                for (const item of materialsUsed) {
                    const material = await Material.findById(item.material);
                    if (material && material.quantity <= material.lowStockThreshold) {
                        notifyLowStock(material);
                    }
                }
            }
            await logAudit({
                req,
                action: 'UPDATE',
                entity: 'Order',
                entityId: updatedOrder._id,
                details: { status: newStatus, price: updatedOrder.price },
            });
            res.json(updatedOrder);
        }
        else {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};
// @desc    Soft delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.softDelete();
            await logAudit({
                req,
                action: 'DELETE',
                entity: 'Order',
                entityId: order._id,
            });
            res.json({ message: 'Order moved to trash' });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get trashed orders
// @route   GET /api/orders/trash
// @access  Private
const getTrashedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ isDeleted: true })
            .populate('customer', 'firstName lastName')
            .sort({ updatedAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Restore order
// @route   PUT /api/orders/:id/restore
// @access  Private
const restoreOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.restore();
            await logAudit({
                req,
                action: 'RESTORE',
                entity: 'Order',
                entityId: order._id,
            });
            res.json({ message: 'Order restored' });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Force delete order
// @route   DELETE /api/orders/:id/force
// @access  Private
const forceDeleteOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(req.params.id).session(session);
        if (order) {
            // Revert stock for materials used
            if (order.materialsUsed && order.materialsUsed.length > 0) {
                if (req.user) {
                    await revertStockForOrder(order.materialsUsed, order._id, req.user._id, session);
                }
            }
            await order.deleteOne({ session });
            await logAudit({
                req,
                action: 'FORCE_DELETE',
                entity: 'Order',
                entityId: order._id,
                session,
            });
            await session.commitTransaction();
            session.endSession();
            res.json({ message: 'Order permanently deleted' });
        }
        else {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get public order status
// @route   GET /api/orders/track/:id
// @access  Public
const getPublicOrderTrack = async (req, res) => {
    try {
        // Validate ObjectId format to prevent casting errors
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const order = await Order.findById(req.params.id)
            .select('status deliveryDate price description style customer')
            .populate('style', 'name image')
            .populate('customer', 'firstName');
        if (order) {
            res.json({
                _id: order._id,
                status: order.status,
                deliveryDate: order.deliveryDate,
                price: order.price,
                description: order.description,
                styleName: order.style?.name,
                customerName: order.customer?.firstName,
                image: order.style?.image
            });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getTrashedOrders, restoreOrder, forceDeleteOrder, getPublicOrderTrack, };
