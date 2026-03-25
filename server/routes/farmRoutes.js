const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const { createFarm, getFarms, getFarmById, deleteFarm } = require('../controllers/farmController');

// @route   POST /api/farms
// @desc    Create a farm
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('farm_name', 'Farm name is required').not().isEmpty(),
            check('area_acres', 'Area in acres is required and must be greater than 0').isFloat({ gt: 0 }),
            check('soil_type', 'Soil type is required').not().isEmpty(),
            check('current_crop', 'Current crop is required').not().isEmpty(),
            check('soil_ph', 'Soil pH must be between 3 and 9').optional({ nullable: true }).isFloat({ min: 3, max: 9 })
        ]
    ],
    createFarm
);

// @route   GET /api/farms
// @desc    Get all farms for the logged in user
// @access  Private
router.get('/', auth, getFarms);

// @route   GET /api/farms/:id
// @desc    Get farm by ID
// @access  Private
router.get('/:id', auth, getFarmById);

// @route   DELETE /api/farms/:id
// @desc    Delete a farm
// @access  Private
router.delete('/:id', auth, deleteFarm);

module.exports = router;
