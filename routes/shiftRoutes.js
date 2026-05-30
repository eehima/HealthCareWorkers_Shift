import express from 'express';
import { discoverShifts, applyForShift } from '../controller/shiftController.js';
import { createShift, getAllShifts, getOneShiftById, updateShiftById, deleteShiftById } from '../controllers/shiftController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Worker routes
router.get('/discover', protect, discoverShifts);
router.post('/:id/apply', protect, applyForShift);

// Facility routes
router.post('/createShift', createShift);
router.get('/getAllShifts', getAllShifts);
router.get('/getOneShiftById/:id', getOneShiftById);
router.patch('/updateShiftById/:id', updateShiftById);
router.delete('/deleteShiftById/:id', deleteShiftById);

export default router;