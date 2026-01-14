import asyncHandler from 'express-async-handler';
import ItemType from '../models/itemTypeModel.js';
// @desc    Fetch all item types
// @route   GET /api/itemtypes
// @access  Private
const getItemTypes = asyncHandler(async (req, res) => {
    const itemTypes = await ItemType.find({ display: 0 });
    res.json(itemTypes);
});
// @desc    Fetch single item type
// @route   GET /api/itemtypes/:id
// @access  Private
const getItemTypeById = asyncHandler(async (req, res) => {
    const itemType = await ItemType.findById(req.params.id);
    if (itemType) {
        res.json(itemType);
    }
    else {
        res.status(404);
        throw new Error('Item Type not found');
    }
});
// @desc    Create an item type
// @route   POST /api/itemtypes
// @access  Private
const createItemType = asyncHandler(async (req, res) => {
    const { name, fields, image } = req.body;
    const itemTypeExists = await ItemType.findOne({ name });
    if (itemTypeExists) {
        res.status(400);
        throw new Error('Item Type already exists');
    }
    const itemType = await ItemType.create({
        name,
        fields,
        image,
    });
    if (itemType) {
        res.status(201).json(itemType);
    }
    else {
        res.status(400);
        throw new Error('Invalid item type data');
    }
});
// @desc    Update an item type
// @route   PUT /api/itemtypes/:id
// @access  Private
const updateItemType = asyncHandler(async (req, res) => {
    const { name, fields, image } = req.body;
    const itemType = await ItemType.findById(req.params.id);
    if (itemType) {
        itemType.name = name;
        itemType.fields = fields;
        itemType.image = image || itemType.image;
        const updatedItemType = await itemType.save();
        res.json(updatedItemType);
    }
    else {
        res.status(404);
        throw new Error('Item Type not found');
    }
});
// @desc    Soft delete an item type
// @route   DELETE /api/itemtypes/:id
// @access  Private
const deleteItemType = asyncHandler(async (req, res) => {
    const itemType = await ItemType.findById(req.params.id);
    if (itemType) {
        itemType.display = 1;
        await itemType.save();
        res.json({ message: 'Item Type moved to trash' });
    }
    else {
        res.status(404);
        throw new Error('Item Type not found');
    }
});
// @desc    Get trashed item types
// @route   GET /api/itemtypes/trash
// @access  Private
const getTrashedItemTypes = asyncHandler(async (req, res) => {
    const itemTypes = await ItemType.find({ display: 1 }).sort({ updatedAt: -1 });
    res.json(itemTypes);
});
// @desc    Restore item type
// @route   PUT /api/itemtypes/:id/restore
// @access  Private
const restoreItemType = asyncHandler(async (req, res) => {
    const itemType = await ItemType.findById(req.params.id);
    if (itemType) {
        itemType.display = 0;
        await itemType.save();
        res.json({ message: 'Item Type restored' });
    }
    else {
        res.status(404);
        throw new Error('Item Type not found');
    }
});
// @desc    Force delete item type
// @route   DELETE /api/itemtypes/:id/force
// @access  Private
const forceDeleteItemType = asyncHandler(async (req, res) => {
    const itemType = await ItemType.findById(req.params.id);
    if (itemType) {
        await itemType.deleteOne();
        res.json({ message: 'Item Type permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Item Type not found');
    }
});
export { getItemTypes, getItemTypeById, createItemType, updateItemType, deleteItemType, getTrashedItemTypes, restoreItemType, forceDeleteItemType, };
