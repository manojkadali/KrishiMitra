const pool = require('../config/db');
const { validationResult } = require('express-validator');

// @route   POST /api/farms
// @desc    Create a farm
exports.createFarm = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            farm_name, area_acres, soil_type, current_crop,
            soil_ph, irrigation_type, sowing_date, previous_crop,
            latitude, longitude, district, state
        } = req.body;

        // Validation logic: At least lat+lon OR dist+state
        const hasLatLon = (latitude !== undefined && latitude !== null) && (longitude !== undefined && longitude !== null);
        const hasDistState = district && state;

        if (!hasLatLon && !hasDistState) {
            return res.status(400).json({ msg: 'Please provide either latitude and longitude, or district and state.' });
        }

        const newFarm = await pool.query(
            `INSERT INTO farms (
                user_id, farm_name, area_acres, soil_type, current_crop,
                soil_ph, irrigation_type, sowing_date, previous_crop,
                latitude, longitude, district, state
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                req.user.id, farm_name, area_acres, soil_type, current_crop,
                soil_ph || null, irrigation_type || null, sowing_date || null, previous_crop || null,
                latitude || null, longitude || null, district || null, state || null
            ]
        );

        res.status(201).json(newFarm.rows[0]);
    } catch (err) {
        console.error('Create farm error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/farms
// @desc    Get all farms for the logged in user
exports.getFarms = async (req, res) => {
    try {
        const farms = await pool.query('SELECT * FROM farms WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(farms.rows);
    } catch (err) {
        console.error('Get farms error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/farms/:id
// @desc    Get a single farm by id
exports.getFarmById = async (req, res) => {
    try {
        const farmId = req.params.id;
        const farm = await pool.query('SELECT * FROM farms WHERE id = $1 AND user_id = $2', [farmId, req.user.id]);

        if (farm.rows.length === 0) {
            return res.status(404).json({ msg: 'Farm not found' });
        }
        res.json(farm.rows[0]);
    } catch (err) {
        console.error('Get farm error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/farms/:id
// @desc    Delete a farm
exports.deleteFarm = async (req, res) => {
    try {
        const farmId = req.params.id;
        const result = await pool.query('DELETE FROM farms WHERE id = $1 AND user_id = $2 RETURNING id', [farmId, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Farm not found or not authorized' });
        }
        res.json({ msg: 'Farm removed' });
    } catch (err) {
        console.error('Delete farm error:', err.message);
        res.status(500).send('Server Error');
    }
};
