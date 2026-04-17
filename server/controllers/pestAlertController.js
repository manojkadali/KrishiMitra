const pool = require('../config/db');
const { generateAlerts } = require('../services/pestAlertService');
const { getWeather } = require('../services/weatherService');

// @route   GET /api/pest-alerts/farm/:farmId
// @desc    Get proactive pest/disease alerts for a specific farm
// @access  Private
exports.getFarmAlerts = async (req, res) => {
    try {
        const farmId = req.params.farmId;
        const farm = await pool.query('SELECT * FROM farms WHERE id = $1 AND user_id = $2', [farmId, req.user.id]);

        if (farm.rows.length === 0) {
            return res.status(404).json({ msg: 'Farm not found' });
        }

        const farmData = farm.rows[0];
        const weather = await getWeather(farmData);
        const alerts = generateAlerts(farmData, weather);

        // Save alerts to DB (skip weather-unavailable info alerts)
        for (const alert of alerts) {
            if (alert.pest_disease === 'Weather Data Unavailable') continue;
            await pool.query(
                `INSERT INTO pest_alerts 
                 (farm_id, user_id, alert_type, severity, pest_disease, message, weather_snapshot)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [farmId, req.user.id, alert.alert_type, alert.severity, alert.pest_disease, alert.message, alert.weather_snapshot ? JSON.stringify(alert.weather_snapshot) : null]
            );
        }

        res.json({ alerts, weather, farm: farmData, weatherAvailable: !!weather });

    } catch (err) {
        console.error('Pest alert error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/pest-alerts/all
// @desc    Get alerts for ALL user farms
// @access  Private
exports.getAllFarmAlerts = async (req, res) => {
    try {
        const farms = await pool.query('SELECT * FROM farms WHERE user_id = $1', [req.user.id]);

        if (farms.rows.length === 0) {
            return res.json({ alerts: [], message: 'No farms registered. Add a farm first.' });
        }

        const allAlerts = [];
        let weatherUnavailableCount = 0;
        for (const farm of farms.rows) {
            const weather = await getWeather(farm);
            if (!weather) weatherUnavailableCount++;
            const alerts = generateAlerts(farm, weather);
            alerts.forEach(a => {
                a.farm_name = farm.farm_name;
                a.farm_id = farm.id;
            });
            allAlerts.push(...alerts);
        }

        // Sort all alerts by severity
        const order = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
        allAlerts.sort((a, b) => (order[a.severity] || 5) - (order[b.severity] || 5));

        res.json({ alerts: allAlerts, farmCount: farms.rows.length, weatherUnavailableCount });

    } catch (err) {
        console.error('All farm alerts error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/pest-alerts/history
// @desc    Get past pest alert history
// @access  Private
exports.getAlertHistory = async (req, res) => {
    try {
        const history = await pool.query(
            `SELECT pa.*, f.farm_name FROM pest_alerts pa 
             LEFT JOIN farms f ON pa.farm_id = f.id 
             WHERE pa.user_id = $1 ORDER BY pa.created_at DESC LIMIT 50`,
            [req.user.id]
        );
        res.json(history.rows);
    } catch (err) {
        console.error('Alert history error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/pest-alerts/:id/read
// @desc    Mark an alert as read
// @access  Private
exports.markAlertRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE pest_alerts SET is_read = true WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ msg: 'Alert marked as read' });
    } catch (err) {
        console.error('Mark alert read error:', err.message);
        res.status(500).send('Server Error');
    }
};
