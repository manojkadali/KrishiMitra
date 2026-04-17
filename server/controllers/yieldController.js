const pool = require('../config/db');
const { predictYield } = require('../services/yieldPredictor');
const { getWeather } = require('../services/weatherService');

// @route   POST /api/yield/predict/:farmId
// @desc    Predict yield for a specific farm
// @access  Private
exports.predictFarmYield = async (req, res) => {
    try {
        const farmId = req.params.farmId;
        const farm = await pool.query('SELECT * FROM farms WHERE id = $1 AND user_id = $2', [farmId, req.user.id]);

        if (farm.rows.length === 0) {
            return res.status(404).json({ msg: 'Farm not found' });
        }

        const farmData = farm.rows[0];
        const weather = await getWeather(farmData);
        const prediction = predictYield(farmData, weather);

        // Save prediction to DB
        await pool.query(
            `INSERT INTO yield_predictions 
             (user_id, farm_id, crop, area_acres, sowing_date, predicted_yield_kg, yield_per_acre, harvest_window_start, harvest_window_end, confidence, factors)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [req.user.id, farmId, prediction.crop, prediction.area_acres, farmData.sowing_date,
             prediction.predicted_yield_kg, prediction.yield_per_acre,
             prediction.harvest_window_start, prediction.harvest_window_end,
             prediction.confidence, JSON.stringify(prediction.factors)]
        );

        res.json({ prediction, weather, farm: farmData });

    } catch (err) {
        console.error('Yield prediction error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/yield/history
// @desc    Get yield prediction history
// @access  Private
exports.getYieldHistory = async (req, res) => {
    try {
        const history = await pool.query(
            `SELECT yp.*, f.farm_name FROM yield_predictions yp 
             LEFT JOIN farms f ON yp.farm_id = f.id 
             WHERE yp.user_id = $1 ORDER BY yp.created_at DESC LIMIT 20`,
            [req.user.id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error('Yield history error:', err.message);
        res.status(500).send('Server Error');
    }
};
