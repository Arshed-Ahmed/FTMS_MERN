import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Material from '../models/Material.js';
import StockMovement from '../models/StockMovement.js';
// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
const getMaterials = asyncHandler(async (req, res) => {
    const materials = await Material.find({ isDeleted: false });
    res.json(materials);
});
// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private
const getMaterialById = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (material) {
        res.json(material);
    }
    else {
        res.status(404);
        throw new Error('Material not found');
    }
});
// @desc    Create a material
// @route   POST /api/materials
// @access  Private
const createMaterial = asyncHandler(async (req, res) => {
    const { name, type, color, quantity, unit, costPerUnit, supplier, lowStockThreshold, description, sku, } = req.body;
    const material = new Material({
        name,
        type,
        color,
        quantity,
        unit,
        costPerUnit,
        supplier,
        lowStockThreshold,
        description,
        sku: sku || `MAT-${Date.now()}`, // Auto-generate SKU if not provided
    });
    const createdMaterial = await material.save();
    res.status(201).json(createdMaterial);
});
// @desc    Update a material
// @route   PUT /api/materials/:id
// @access  Private
const updateMaterial = asyncHandler(async (req, res) => {
    const { name, type, color, quantity, unit, costPerUnit, supplier, lowStockThreshold, description, sku, } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const material = await Material.findById(req.params.id).session(session);
        if (material) {
            // Check if quantity changed and log it
            if (quantity !== undefined && quantity !== material.quantity) {
                const diff = quantity - material.quantity;
                const type = diff > 0 ? 'IN' : 'OUT';
                if (req.user) {
                    await StockMovement.create([{
                            material: material._id,
                            type,
                            quantity: Math.abs(diff),
                            reason: 'Manual Update',
                            reference: 'Material Edit',
                            performedBy: req.user._id,
                            date: Date.now()
                        }], { session });
                }
            }
            material.name = name || material.name;
            material.type = type || material.type;
            material.color = color || material.color;
            material.quantity = quantity !== undefined ? quantity : material.quantity;
            material.unit = unit || material.unit;
            material.costPerUnit = costPerUnit !== undefined ? costPerUnit : material.costPerUnit;
            material.supplier = supplier || material.supplier;
            material.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : material.lowStockThreshold;
            material.description = description || material.description;
            material.sku = sku || material.sku;
            const updatedMaterial = await material.save({ session });
            await session.commitTransaction();
            session.endSession();
            res.json(updatedMaterial);
        }
        else {
            await session.abortTransaction();
            session.endSession();
            res.status(404);
            throw new Error('Material not found');
        }
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(error.message);
    }
});
// @desc    Adjust stock quantity
// @route   POST /api/materials/:id/adjust
// @access  Private
const adjustStock = asyncHandler(async (req, res) => {
    const { quantity, type, reason, notes } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const material = await Material.findById(req.params.id).session(session);
        if (!material) {
            res.status(404);
            throw new Error('Material not found');
        }
        if (!req.user) {
            res.status(401);
            throw new Error('User not found');
        }
        const oldQuantity = material.quantity;
        let newQuantity = oldQuantity;
        let logType = type;
        let logQuantity = Number(quantity);
        if (type === 'IN') {
            newQuantity += Number(quantity);
        }
        else if (type === 'OUT') {
            newQuantity -= Number(quantity);
        }
        else if (type === 'ADJUSTMENT') {
            newQuantity = Number(quantity);
            const diff = newQuantity - oldQuantity;
            logType = diff >= 0 ? 'IN' : 'OUT';
            logQuantity = Math.abs(diff);
        }
        if (newQuantity < 0) {
            res.status(400);
            throw new Error('Stock cannot be negative');
        }
        material.quantity = newQuantity;
        await material.save({ session });
        await StockMovement.create([{
                material: material._id,
                type: logType,
                quantity: logQuantity,
                reason: reason || 'Manual Adjustment',
                reference: notes || 'Stock Take',
                performedBy: req.user._id,
                date: Date.now()
            }], { session });
        await session.commitTransaction();
        session.endSession();
        res.json(material);
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error(error.message);
    }
});
// @desc    Get stock movements for a material
// @route   GET /api/materials/:id/movements
// @access  Private
const getStockMovements = asyncHandler(async (req, res) => {
    const movements = await StockMovement.find({ material: req.params.id })
        .populate('performedBy', 'username')
        .sort({ date: -1 });
    res.json(movements);
});
// @desc    Soft delete a material
// @route   DELETE /api/materials/:id
// @access  Private
const deleteMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (material) {
        await material.softDelete();
        res.json({ message: 'Material moved to trash' });
    }
    else {
        res.status(404);
        throw new Error('Material not found');
    }
});
// @desc    Get trashed materials
// @route   GET /api/materials/trash
// @access  Private
const getTrashedMaterials = asyncHandler(async (req, res) => {
    const materials = await Material.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(materials);
});
// @desc    Restore material
// @route   PUT /api/materials/:id/restore
// @access  Private
const restoreMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (material) {
        await material.restore();
        res.json({ message: 'Material restored' });
    }
    else {
        res.status(404);
        throw new Error('Material not found');
    }
});
// @desc    Force delete material
// @route   DELETE /api/materials/:id/force
// @access  Private
const forceDeleteMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);
    if (material) {
        await material.deleteOne();
        res.json({ message: 'Material permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Material not found');
    }
});
export { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getTrashedMaterials, restoreMaterial, forceDeleteMaterial, adjustStock, getStockMovements, };
