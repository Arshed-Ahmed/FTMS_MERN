import express from 'express';
import { getEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee, getTrashedEmployees, restoreEmployee, forceDeleteEmployee, } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/trash', protect, getTrashedEmployees);
router.put('/:id/restore', protect, restoreEmployee);
router.delete('/:id/force', protect, forceDeleteEmployee);
router.route('/').get(protect, getEmployees).post(protect, createEmployee);
router
    .route('/:id')
    .get(protect, getEmployeeById)
    .put(protect, updateEmployee)
    .delete(protect, deleteEmployee);
export default router;
