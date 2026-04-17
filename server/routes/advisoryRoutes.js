const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const advisoryController = require('../controllers/advisoryController');

// @route   POST /api/advisories/simplified
// @desc    Generate a simplified advisory based on 7 inputs
// @access  Private
router.post(
    '/simplified',
    [
        auth,
        [
            check('nitrogen', 'Nitrogen (N) value is required').isNumeric(),
            check('phosphorous', 'Phosphorous (P) value is required').isNumeric(),
            check('potassium', 'Potassium (K) value is required').isNumeric(),
            check('temperature', 'Temperature value is required').isNumeric(),
            check('humidity', 'Humidity value is required').isNumeric(),
            check('ph', 'pH value is required').isNumeric(),
            check('rainfall', 'Rainfall value is required').isNumeric()
        ]
    ],
    advisoryController.generateSimplifiedAdvisory
);

// @route   GET /api/advisories/history
// @desc    Get simplified advisory history for user
// @access  Private
router.get('/history', auth, advisoryController.getAdvisoryHistory);

// @route   GET /api/advisories/weather
// @desc    Fetch current temperature, humidity, and rainfall by city name 
// @access  Private
router.get('/weather', auth, advisoryController.getWeatherByCity);

module.exports = router;
