import asyncHandler from 'express-async-handler';
import Employee from '../models/employeeModel.js';
// @desc    Fetch all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find({ display: 0 });
    res.json(employees);
});
// @desc    Fetch single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
        res.json(employee);
    }
    else {
        res.status(404);
        throw new Error('Employee not found');
    }
});
// @desc    Create an employee
// @route   POST /api/employees
// @access  Private
const createEmployee = asyncHandler(async (req, res) => {
    const { firstName, lastName, nic, address, phone, email, category, startDate, salary, status, } = req.body;
    const employee = new Employee({
        firstName,
        lastName,
        nic,
        address,
        phone,
        email,
        category,
        startDate,
        salary,
        status,
    });
    const createdEmployee = await employee.save();
    res.status(201).json(createdEmployee);
});
// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = asyncHandler(async (req, res) => {
    const { firstName, lastName, nic, address, phone, email, category, startDate, salary, status, } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (employee) {
        employee.firstName = firstName;
        employee.lastName = lastName;
        employee.nic = nic;
        employee.address = address;
        employee.phone = phone;
        employee.email = email;
        employee.category = category;
        employee.startDate = startDate;
        employee.salary = salary;
        employee.status = status;
        const updatedEmployee = await employee.save();
        res.json(updatedEmployee);
    }
    else {
        res.status(404);
        throw new Error('Employee not found');
    }
});
// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
        employee.display = 1; // Soft delete
        await employee.save();
        res.json({ message: 'Employee removed' });
    }
    else {
        res.status(404);
        throw new Error('Employee not found');
    }
});
// @desc    Get trashed employees
// @route   GET /api/employees/trash
// @access  Private/Admin
const getTrashedEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find({ display: 1 });
    res.json(employees);
});
// @desc    Restore employee
// @route   PUT /api/employees/:id/restore
// @access  Private/Admin
const restoreEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
        employee.display = 0;
        await employee.save();
        res.json({ message: 'Employee restored' });
    }
    else {
        res.status(404);
        throw new Error('Employee not found');
    }
});
// @desc    Force delete employee
// @route   DELETE /api/employees/:id/force
// @access  Private/Admin
const forceDeleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (employee) {
        await employee.deleteOne();
        res.json({ message: 'Employee permanently deleted' });
    }
    else {
        res.status(404);
        throw new Error('Employee not found');
    }
});
export { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getTrashedEmployees, restoreEmployee, forceDeleteEmployee, };
