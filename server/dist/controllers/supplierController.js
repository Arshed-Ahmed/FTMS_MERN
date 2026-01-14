import asyncHandler from 'express-async-handler';
import Supplier from '../models/Supplier.js';
// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({ display: 0 }).sort({ createdAt: -1 });
    res.json(suppliers);
});
// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
        res.json(supplier);
    }
    else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});
// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
    const { name, contactPerson, email, phone, address, paymentTerms } = req.body;
    const supplier = new Supplier({
        name,
        contactPerson,
        email,
        phone,
        address,
        paymentTerms,
    });
    const createdSupplier = await supplier.save();
    res.status(201).json(createdSupplier);
});
// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
    const { name, contactPerson, email, phone, address, paymentTerms } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
        supplier.name = name || supplier.name;
        supplier.contactPerson = contactPerson || supplier.contactPerson;
        supplier.email = email || supplier.email;
        supplier.phone = phone || supplier.phone;
        supplier.address = address || supplier.address;
        supplier.paymentTerms = paymentTerms || supplier.paymentTerms;
        const updatedSupplier = await supplier.save();
        res.json(updatedSupplier);
    }
    else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});
// @desc    Soft delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
        supplier.display = 1;
        await supplier.save();
        res.json({ message: 'Supplier moved to trash' });
    }
    else {
        res.status(404);
        throw new Error('Supplier not found');
    }
});
export { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, };
