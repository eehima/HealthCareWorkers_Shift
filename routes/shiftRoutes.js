const express = require('express');
const router = express.Router();

const { discoverShifts, applyForShift } = require('../controller/shiftController');
const { createShift, getAllShifts, getOneShiftById, updateShiftById, deleteShiftById } = require('../controllers/shiftController.js');
const protect = require('../middleware/authMiddleware');

// Worker routes
router.get('/discover', protect, discoverShifts);
router.post('/:id/apply', protect, applyForShift);

// Facility routes
router.post('/createShift', createShift);
router.get('/getAllShifts', getAllShifts);
router.get('/getOneShiftById/:id', getOneShiftById);
router.patch('/updateShiftById/:id', updateShiftById);
router.delete('/deleteShiftById/:id', deleteShiftById);

module.exports = router;