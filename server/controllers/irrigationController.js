const pool = require('../config/db');
const { generateSchedule } = require('../services/irrigationScheduler');
const { getWeather } = require('../services/weatherService');

// @route   POST /api/irrigation/schedule/:farmId
// @desc    Generate irrigation schedule for a farm
// @access  Private
exports.getIrrigationSchedule = async (req, res) => {
    try {
        const farmId = req.params.farmId;
        const farm = await pool.query('SELECT * FROM farms WHERE id = $1 AND user_id = $2', [farmId, req.user.id]);

        if (farm.rows.length === 0) {
            return res.status(404).json({ msg: 'Farm not found' });
        }

        const farmData = farm.rows[0];
        const weather = await getWeather(farmData);
        const schedule = generateSchedule(farmData, weather);

        // Save schedule to DB
        await pool.query(
            `INSERT INTO irrigation_schedules 
             (user_id, farm_id, crop, soil_type, irrigation_type, sowing_date, schedule, next_irrigation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [req.user.id, farmId, farmData.current_crop, farmData.soil_type, farmData.irrigation_type, farmData.sowing_date, JSON.stringify(schedule), schedule.nextIrrigation]
        );

        res.json({ schedule, weather, farm: farmData });

    } catch (err) {
        console.error('Irrigation schedule error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/irrigation/history
// @desc    Get irrigation schedule history
// @access  Private
exports.getIrrigationHistory = async (req, res) => {
    try {
        const history = await pool.query(
            `SELECT s.*, f.farm_name FROM irrigation_schedules s 
             LEFT JOIN farms f ON s.farm_id = f.id 
             WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 20`,
            [req.user.id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error('Irrigation history error:', err.message);
        res.status(500).send('Server Error');
    }
};
