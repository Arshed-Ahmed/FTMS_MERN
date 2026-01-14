import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Supplier from '../models/Supplier.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const suppliers = await Supplier.find({ isDeleted: false }).sort({ createdAt: -1 });
  res.json(suppliers);
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);
  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req: Request, res: Response) => {
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

  await logAudit({
    req,
    action: 'CREATE',
    entity: 'Supplier',
    entityId: createdSupplier._id,
    details: { name, email },
  });

  res.status(201).json(createdSupplier);
});

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
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

    await logAudit({
      req,
      action: 'UPDATE',
      entity: 'Supplier',
      entityId: updatedSupplier._id,
      details: { name, email },
    });

    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Soft delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    await supplier.softDelete();

    await logAudit({
      req,
      action: 'DELETE',
      entity: 'Supplier',
      entityId: supplier._id,
    });

    res.json({ message: 'Supplier moved to trash' });
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Get trashed suppliers
// @route   GET /api/suppliers/trash
// @access  Private
const getTrashedSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const suppliers = await Supplier.find({ isDeleted: true }).sort({ updatedAt: -1 });
  res.json(suppliers);
});

// @desc    Restore supplier
// @route   PUT /api/suppliers/:id/restore
// @access  Private
const restoreSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);
  if (supplier) {
    await supplier.restore();

    await logAudit({
      req,
      action: 'RESTORE',
      entity: 'Supplier',
      entityId: supplier._id,
    });

    res.json({ message: 'Supplier restored' });
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

// @desc    Force delete supplier
// @route   DELETE /api/suppliers/:id/force
// @access  Private
const forceDeleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await Supplier.findById(req.params.id);
  if (supplier) {
    await supplier.deleteOne();

    await logAudit({
      req,
      action: 'FORCE_DELETE',
      entity: 'Supplier',
      entityId: supplier._id,
    });

    res.json({ message: 'Supplier permanently deleted' });
  } else {
    res.status(404);
    throw new Error('Supplier not found');
  }
});

export {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getTrashedSuppliers,
  restoreSupplier,
  forceDeleteSupplier,
};
