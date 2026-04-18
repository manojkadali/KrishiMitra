const pool = require('../config/db');
const { generateForecast } = require('../services/priceForecaster');

// @route   GET /api/market/forecast
// @desc    Get price trend + forecast for a commodity
// @access  Private
exports.getPriceForecast = async (req, res) => {
    try {
        const { commodity, state } = req.query;

        if (!commodity || !state) {
            return res.status(400).json({ msg: 'Please provide commodity and state' });
        }

        // Try to get historical data from DB
        const dbHistory = await pool.query(
            `SELECT modal_price, recorded_at FROM market_price_history 
             WHERE LOWER(commodity) = LOWER($1) AND LOWER(state) = LOWER($2) 
             ORDER BY recorded_at ASC LIMIT 60`,
            [commodity, state]
        );

        const forecast = generateForecast(commodity, state, dbHistory.rows);

        res.json(forecast);

    } catch (err) {
        console.error('Price forecast error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/market/record-price
// @desc    Record a market price data point (for trend building)
// @access  Private
exports.recordPrice = async (req, res) => {
    try {
        const { commodity, state, district, modal_price, min_price, max_price } = req.body;

        if (!commodity || !state || !modal_price) {
            return res.status(400).json({ msg: 'commodity, state, and modal_price are required' });
        }

        await pool.query(
            `INSERT INTO market_price_history (commodity, state, district, modal_price, min_price, max_price)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [commodity, state, district || null, modal_price, min_price || null, max_price || null]
        );

        res.json({ msg: 'Price recorded' });
    } catch (err) {
        console.error('Record price error:', err.message);
        res.status(500).send('Server Error');
    }
};
