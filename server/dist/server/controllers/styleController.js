import asyncHandler from 'express-async-handler';
import Style from '../models/styleModel.js';
import { logAudit } from '../services/auditService.js';
// @desc    Fetch all styles
// @route   GET /api/styles
// @access  Private
const getStyles = asyncHandler(async (req, res) => {
    const styles = await Style.find({ isDeleted: false });
    res.json(styles);
});
// @desc    Fetch single style
// @route   GET /api/styles/:id
// @access  Private
const getStyleById = asyncHandler(async (req, res) => {
    const style = await Style.findById(req.params.id);
    if (style) {
        res.json(style);
    }
    else {
        res.status(404);
        throw new Error('Style not found');
    }
});
// @desc    Create a style
// @route   POST /api/styles
// @access  Private
const createStyle = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;
    const style = new Style({
        name,
        description,
        image,
    });
    const createdStyle = await style.save();
    await logAudit({
        req,
        action: 'CREATE',
        entity: 'Style',
        entityId: createdStyle._id,
        details: { name },
    });
    res.status(201).json(createdStyle);
});
// @desc    Update a style
// @route   PUT /api/styles/:id
// @access  Private
const updateStyle = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;
    const style = await Style.findById(req.params.id);
    if (style) {
        style.name = name;
        style.description = description;
        if (image) {
            style.image = image;
        }
        const updatedStyle = await style.save();
        await logAudit({
            req,
            action: 'UPDATE',
            entity: 'Style',
            entityId: updatedStyle._id,
            details: { name },
        });
        res.json(updatedStyle);
    }
    else {
        res.status(404);
        throw new Error('Style not found');
    }
});
// @desc    Delete a style
// @route   DELETE /api/styles/:id
// @access  Private
const deleteStyle = asyncHandler(async (req, res) => {
    const style = await Style.findById(req.params.id);
    if (style) {
        await style.softDelete();
        await logAudit({
            req,
            action: 'DELETE',
            entity: 'Style',
            entityId: style._id,
        });
        res.json({ message: 'Style removed' });
    }
    else {
        res.status(404);
        throw new Error('Style not found');
    }
});
// @desc    Get trashed styles
// @route   GET /api/styles/trash
// @access  Private
const getTrashedStyles = asyncHandler(async (req, res) => {
    const styles = await Style.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(styles);
});
// @desc    Restore style
// @route   PUT /api/styles/:id/restore
// @access  Private
const restoreStyle = asyncHandler(async (req, res) => {
    const style = await Style.findById(req.params.id);
    if (style) {
        await style.restore();
        await logAudit({
            req,
            action: 'RESTORE',
            entity: 'Style',
            entityId: style._id,
        });
        res.json({ message: 'Style restored' });
    }
    else {
        res.status(404);
        throw new Error('Style not found');
    }
});
// @desc    Force delete style
// @route   DELETE /api/styles/:id/force
// @access  Private
const forceDeleteStyle = asyncHandler(async (req, res) => {
    const style = await Style.findById(req.params.id);
    if (style) {
        await style.deleteOne();
        await logAudit({
            req,
            action: 'FORCE_DELETE',
            entity: 'Style',
            entityId: style._id,
        });
        res.json({ message: 'Style permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Style not found');
    }
});
export { getStyles, getStyleById, createStyle, updateStyle, deleteStyle, getTrashedStyles, restoreStyle, forceDeleteStyle, };
