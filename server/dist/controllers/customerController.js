import asyncHandler from 'express-async-handler';
import Customer from '../models/customerModel.js';
// @desc    Fetch all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({ display: 0 }); // Assuming 0 is active/visible
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
        // Soft delete by setting display to 1 (or whatever logic was used in PHP, assuming 1 is hidden)
        // Or hard delete if preferred. The PHP code had 'Display' column.
        // Let's do soft delete to match the schema default 0.
        customer.display = 1;
        await customer.save();
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
    const customers = await Customer.find({ display: 1 });
    res.json(customers);
});
// @desc    Restore customer
// @route   PUT /api/customers/:id/restore
// @access  Private/Admin
const restoreCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
        customer.display = 0;
        await customer.save();
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
        res.json({ message: 'Customer permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Customer not found');
    }
});
export { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getTrashedCustomers, restoreCustomer, forceDeleteCustomer, };
