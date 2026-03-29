const pool = require('../config/db');

// @desc    Get the total rainfall for the last 30 days for a specific location
exports.get_last_30_days_rainfall = async (location) => {
    try {
        const query = `
            SELECT SUM(rainfall) as total_rainfall
            FROM daily_weather
            WHERE location ILIKE $1 
              AND date >= CURRENT_DATE - INTERVAL '30 days'
        `;
        const result = await pool.query(query, [location]);
        
        // If no records matching, result.rows[0].total_rainfall might be null
        const total = result.rows[0].total_rainfall;
        return total ? parseFloat(total) : 0;
    } catch (err) {
        console.error(`Error calculating 30-day rainfall for ${location}:`, err.message);
        return 0; // Fallback to 0
    }
};

// @desc    Get the total rainfall for the last 90 days for a specific location
exports.get_last_90_days_rainfall = async (location) => {
    try {
        const query = `
            SELECT SUM(rainfall) as total_rainfall
            FROM daily_weather
            WHERE location ILIKE $1 
              AND date >= CURRENT_DATE - INTERVAL '90 days'
        `;
        const result = await pool.query(query, [location]);
        
        const total = result.rows[0].total_rainfall;
        return total ? parseFloat(total) : 0;
    } catch (err) {
        console.error(`Error calculating 90-day rainfall for ${location}:`, err.message);
        return 0;
    }
};
