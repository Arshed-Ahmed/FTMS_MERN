import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel.js';
import { logAudit } from '../services/auditService.js';
// @desc    Fetch all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({ isDeleted: false });
    res.json(customers);
});
// @desc    Fetch single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
        res.json(customer);
    }
    else {
        res.status(404);
        throw new Error('Customer not found');
    }
});
// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
    const { firstName, lastName, nic, phone, email, address } = req.body;
    const customer = new Customer({
        firstName,
        lastName,
        nic,
        phone,
        email,
        address,
    });
    const createdCustomer = await customer.save();
    await logAudit({
        req,
        action: 'CREATE',
        entity: 'Customer',
        entityId: createdCustomer._id,
        details: { firstName, lastName, email },
    });
    res.status(201).json(createdCustomer);
});
// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
    const { firstName, lastName, nic, phone, email, address } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (customer) {
        customer.firstName = firstName;
        customer.lastName = lastName;
        customer.nic = nic;
        customer.phone = phone;
        customer.email = email;
        customer.address = address;
        const updatedCustomer = await customer.save();
        await logAudit({
            req,
            action: 'UPDATE',
            entity: 'Customer',
            entityId: updatedCustomer._id,
            details: { firstName, lastName, email },
        });
        res.json(updatedCustomer);
    }
    else {
        res.status(404);
        throw new Error('Customer not found');
    }
});
// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
        await customer.softDelete();
        await logAudit({
            req,
            action: 'DELETE',
            entity: 'Customer',
            entityId: customer._id,
        });
        res.json({ message: 'Customer removed' });
    }
    else {
        res.status(404);
        throw new Error('Customer not found');
    }
});
// @desc    Get trashed customers
// @route   GET /api/customers/trash
// @access  Private/Admin
const getTrashedCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({ isDeleted: true });
    res.json(customers);
});
// @desc    Restore customer
// @route   PUT /api/customers/:id/restore
// @access  Private/Admin
const restoreCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
        await customer.restore();
        await logAudit({
            req,
            action: 'RESTORE',
            entity: 'Customer',
            entityId: customer._id,
        });
        res.json({ message: 'Customer restored' });
    }
    else {
        res.status(404);
        throw new Error('Customer not found');
    }
});
// @desc    Force delete customer
// @route   DELETE /api/customers/:id/force
// @access  Private/Admin
const forceDeleteCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
        await customer.deleteOne();
        await logAudit({
            req,
            action: 'FORCE_DELETE',
            entity: 'Customer',
            entityId: customer._id,
        });
        res.json({ message: 'Customer permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Customer not found');
    }
});
export { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getTrashedCustomers, restoreCustomer, forceDeleteCustomer, };
