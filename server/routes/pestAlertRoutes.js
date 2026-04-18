const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getFarmAlerts, getAllFarmAlerts, getAlertHistory, markAlertRead } = require('../controllers/pestAlertController');

// @route   GET /api/pest-alerts/all
// @desc    Get alerts for all user farms
// @access  Private
router.get('/all', auth, getAllFarmAlerts);

// @route   GET /api/pest-alerts/farm/:farmId
// @desc    Get pest alerts for a specific farm
// @access  Private
router.get('/farm/:farmId', auth, getFarmAlerts);

// @route   GET /api/pest-alerts/history
// @desc    Get alert history
// @access  Private
router.get('/history', auth, getAlertHistory);

// @route   PUT /api/pest-alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put('/:id/read', auth, markAlertRead);

module.exports = router;
