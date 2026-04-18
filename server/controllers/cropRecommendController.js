const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { recommendCrops } = require('../services/cropRecommendation');
const { getWeather } = require('../services/weatherService');

// @route   POST /api/crop-recommend
// @desc    Get crop recommendations based on soil + weather data
// @access  Private
exports.getCropRecommendation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, soil_type, farm_id } = req.body;

        const recommendations = recommendCrops({
            nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, soil_type,
        });

        // Save to DB
        await pool.query(
            `INSERT INTO crop_recommendations 
             (user_id, farm_id, nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, recommended_crops)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [req.user.id, farm_id || null, nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, JSON.stringify(recommendations)]
        );

        res.json({ recommendations });

    } catch (err) {
        console.error('Crop recommendation error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/crop-recommend/from-farm/:farmId
// @desc    Auto-recommend crops using farm data + live weather
// @access  Private
exports.getRecommendationFromFarm = async (req, res) => {
    try {
        const farmId = req.params.farmId;
        const farm = await pool.query('SELECT * FROM farms WHERE id = $1 AND user_id = $2', [farmId, req.user.id]);

        if (farm.rows.length === 0) {
            return res.status(404).json({ msg: 'Farm not found' });
        }

        const farmData = farm.rows[0];
        const weather = await getWeather(farmData);

        const body = req.body || {};
        const inputs = {
            nitrogen: body.nitrogen || 50,
            phosphorous: body.phosphorous || 40,
            potassium: body.potassium || 40,
            temperature: weather ? weather.temperature : 25,
            humidity: weather ? weather.humidity : 60,
            ph: farmData.soil_ph || 6.5,
            rainfall: weather ? (weather.forecastRainfall || 0) * 30 : 80,
            soil_type: farmData.soil_type,
        };

        const recommendations = recommendCrops(inputs);

        await pool.query(
            `INSERT INTO crop_recommendations 
             (user_id, farm_id, nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, recommended_crops)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [req.user.id, farmId, inputs.nitrogen, inputs.phosphorous, inputs.potassium, inputs.temperature, inputs.humidity, inputs.ph, inputs.rainfall, JSON.stringify(recommendations)]
        );

        res.json({ recommendations, weather, farm: farmData });

    } catch (err) {
        console.error('Farm recommendation error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/crop-recommend/history
// @desc    Get recommendation history
// @access  Private
exports.getRecommendationHistory = async (req, res) => {
    try {
        const history = await pool.query(
            'SELECT * FROM crop_recommendations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error('Recommendation history error:', err.message);
        res.status(500).send('Server Error');
    }
};
