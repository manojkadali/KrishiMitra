const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { predictFarmYield, getYieldHistory } = require('../controllers/yieldController');

// @route   POST /api/yield/predict/:farmId
// @desc    Predict yield for a farm
// @access  Private
router.post('/predict/:farmId', auth, predictFarmYield);

// @route   GET /api/yield/history
// @desc    Get yield prediction history
// @access  Private
router.get('/history', auth, getYieldHistory);

module.exports = router;
