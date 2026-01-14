import Measurement from '../models/Measurement.js';
// @desc    Get all measurements
// @route   GET /api/measurements
// @access  Private
const getMeasurements = async (req, res) => {
    try {
        const measurements = await Measurement.find({ display: 0 })
            .populate('customer', 'firstName lastName phone')
            .sort({ createdAt: -1 });
        res.json(measurements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get single measurement
// @route   GET /api/measurements/:id
// @access  Private
const getMeasurementById = async (req, res) => {
    try {
        const measurement = await Measurement.findById(req.params.id)
            .populate('customer', 'name email phone');
        if (measurement) {
            res.json(measurement);
        }
        else {
            res.status(404).json({ message: 'Measurement not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get measurements by customer
// @route   GET /api/measurements/customer/:customerId
// @access  Private
const getMeasurementsByCustomer = async (req, res) => {
    try {
        const measurements = await Measurement.find({ customer: req.params.customerId })
            .populate('customer', 'name')
            .sort({ createdAt: -1 });
        res.json(measurements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Create new measurement
// @route   POST /api/measurements
// @access  Private
const createMeasurement = async (req, res) => {
    const { customer, item, values, notes, moreDetails, } = req.body;
    try {
        const measurement = new Measurement({
            customer,
            item,
            values,
            notes,
            moreDetails,
        });
        const createdMeasurement = await measurement.save();
        res.status(201).json(createdMeasurement);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Update measurement
// @route   PUT /api/measurements/:id
// @access  Private
const updateMeasurement = async (req, res) => {
    const { customer, item, values, notes, moreDetails, } = req.body;
    try {
        const measurement = await Measurement.findById(req.params.id);
        if (measurement) {
            measurement.customer = customer || measurement.customer;
            measurement.item = item || measurement.item;
            measurement.values = values || measurement.values;
            measurement.notes = notes || measurement.notes;
            measurement.moreDetails = moreDetails || measurement.moreDetails;
            const updatedMeasurement = await measurement.save();
            res.json(updatedMeasurement);
        }
        else {
            res.status(404).json({ message: 'Measurement not found' });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// @desc    Soft delete measurement
// @route   DELETE /api/measurements/:id
// @access  Private
const deleteMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.findById(req.params.id);
        if (measurement) {
            measurement.display = 1;
            await measurement.save();
            res.json({ message: 'Measurement moved to trash' });
        }
        else {
            res.status(404).json({ message: 'Measurement not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get trashed measurements
// @route   GET /api/measurements/trash
// @access  Private
const getTrashedMeasurements = async (req, res) => {
    try {
        const measurements = await Measurement.find({ display: 1 })
            .populate('customer', 'firstName lastName')
            .sort({ updatedAt: -1 });
        res.json(measurements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Restore measurement
// @route   PUT /api/measurements/:id/restore
// @access  Private
const restoreMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.findById(req.params.id);
        if (measurement) {
            measurement.display = 0;
            await measurement.save();
            res.json({ message: 'Measurement restored' });
        }
        else {
            res.status(404).json({ message: 'Measurement not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Force delete measurement
// @route   DELETE /api/measurements/:id/force
// @access  Private
const forceDeleteMeasurement = async (req, res) => {
    try {
        const measurement = await Measurement.findById(req.params.id);
        if (measurement) {
            await measurement.deleteOne();
            res.json({ message: 'Measurement permanently deleted' });
        }
        else {
            res.status(404).json({ message: 'Measurement not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export { getMeasurements, getMeasurementById, getMeasurementsByCustomer, createMeasurement, updateMeasurement, deleteMeasurement, getTrashedMeasurements, restoreMeasurement, forceDeleteMeasurement, };
