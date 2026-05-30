const express = require('express');
const router = express.Router();
const { discoverShifts, applyForShift } = require('../controller/shiftController');
const protect = require('../middleware/authMiddleware');

// GET /api/worker/shifts/discover
router.get('/discover', protect, discoverShifts);

// POST /api/worker/shifts/:id/apply
router.post('/:id/apply', protect, applyForShift);

module.exports = router;