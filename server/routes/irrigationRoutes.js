const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getIrrigationSchedule, getIrrigationHistory } = require('../controllers/irrigationController');

// @route   POST /api/irrigation/schedule/:farmId
// @desc    Generate irrigation schedule for a farm
// @access  Private
router.post('/schedule/:farmId', auth, getIrrigationSchedule);

// @route   GET /api/irrigation/history
// @desc    Get irrigation schedule history
// @access  Private
router.get('/history', auth, getIrrigationHistory);

module.exports = router;
