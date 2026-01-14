import Job from '../models/Job.js';
import Order from '../models/Order.js';
import { notifyJobAssigned } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isDeleted: false })
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
        await logAudit({
            req,
            action: 'CREATE',
            entity: 'Job',
            entityId: createdJob._id,
            details: { order, employee, status },
        });
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
            await logAudit({
                req,
                action: 'UPDATE',
                entity: 'Job',
                entityId: updatedJob._id,
                details: { status, employee },
            });
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
            await job.softDelete();
            await logAudit({
                req,
                action: 'DELETE',
                entity: 'Job',
                entityId: job._id,
            });
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
        const jobs = await Job.find({ isDeleted: true })
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
            await job.restore();
            await logAudit({
                req,
                action: 'RESTORE',
                entity: 'Job',
                entityId: job._id,
            });
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
            await logAudit({
                req,
                action: 'FORCE_DELETE',
                entity: 'Job',
                entityId: job._id,
            });
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
