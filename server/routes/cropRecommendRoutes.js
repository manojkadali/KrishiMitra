const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const { getCropRecommendation, getRecommendationFromFarm, getRecommendationHistory } = require('../controllers/cropRecommendController');

// @route   POST /api/crop-recommend
// @desc    Get crop recommendations from manual inputs
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('nitrogen', 'Nitrogen value is required').isNumeric(),
            check('phosphorous', 'Phosphorous value is required').isNumeric(),
            check('potassium', 'Potassium value is required').isNumeric(),
            check('temperature', 'Temperature is required').isNumeric(),
            check('humidity', 'Humidity is required').isNumeric(),
            check('ph', 'pH is required').isNumeric(),
            check('rainfall', 'Rainfall is required').isNumeric(),
        ]
    ],
    getCropRecommendation
);

// @route   POST /api/crop-recommend/from-farm/:farmId
// @desc    Auto-recommend using farm data + live weather
// @access  Private
router.post('/from-farm/:farmId', auth, getRecommendationFromFarm);

// @route   GET /api/crop-recommend/history
// @desc    Get recommendation history
// @access  Private
router.get('/history', auth, getRecommendationHistory);

module.exports = router;
