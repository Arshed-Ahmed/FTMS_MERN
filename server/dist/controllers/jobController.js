import Job from '../models/Job.js';
import Order from '../models/Order.js';
import { notifyJobAssigned } from '../services/notificationService.js';
// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ display: 0 })
            .populate({
            path: 'order',
            populate: { path: 'customer style' }
        })
            .populate('employee', 'firstName lastName phone')
            .sort({ createdAt: -1 });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate({
            path: 'order',
            populate: { path: 'customer style' }
        })
            .populate('employee', 'name phone');
        if (job) {
            res.json(job);
        }
        else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
    const { order, employee, assignedDate, deadline, details, status, } = req.body;
    try {
        const job = new Job({
            order,
            employee,
            assignedDate,
            deadline,
            details,
            status,
        });
        const createdJob = await job.save();
        // Notify Employee
        if (employee) {
            const orderDoc = await Order.findById(order);
            if (orderDoc) {
                // Cast to any or IOrder because of mongoose document type issues if strict
                notifyJobAssigned(employee, orderDoc);
            }
        }
        res.status(201).json(createdJob);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res) => {
    const { order, employee, assignedDate, deadline, details, status, } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            job.order = order || job.order;
            job.employee = employee || job.employee;
            job.assignedDate = assignedDate || job.assignedDate;
            job.deadline = deadline || job.deadline;
            job.details = details || job.details;
            job.status = status || job.status;
            const updatedJob = await job.save();
            // Notify Employee if changed or newly assigned
            if (employee && employee !== job.employee.toString()) {
                const orderDoc = await Order.findById(job.order);
                if (orderDoc) {
                    notifyJobAssigned(employee, orderDoc);
                }
            }
            res.json(updatedJob);
        }
        else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Soft delete job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            job.display = 1;
            await job.save();
            res.json({ message: 'Job moved to trash' });
        }
        else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get trashed jobs
// @route   GET /api/jobs/trash
// @access  Private
const getTrashedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ display: 1 })
            .populate({
            path: 'order',
            populate: { path: 'customer style' }
        })
            .populate('employee', 'firstName lastName')
            .sort({ updatedAt: -1 });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Restore job
// @route   PUT /api/jobs/:id/restore
// @access  Private
const restoreJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            job.display = 0;
            await job.save();
            res.json({ message: 'Job restored' });
        }
        else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Force delete job
// @route   DELETE /api/jobs/:id/force
// @access  Private
const forceDeleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            await job.deleteOne();
            res.json({ message: 'Job permanently deleted' });
        }
        else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export { getJobs, getJobById, createJob, updateJob, deleteJob, getTrashedJobs, restoreJob, forceDeleteJob, };
