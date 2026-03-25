require('dotenv').config();
const pool = require('./config/db');

const createMissingTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS simplified_advisories (
                id SERIAL PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                nitrogen NUMERIC NOT NULL,
                phosphorous NUMERIC NOT NULL,
                potassium NUMERIC NOT NULL,
                temperature NUMERIC NOT NULL,
                humidity NUMERIC NOT NULL,
                ph NUMERIC NOT NULL,
                rainfall NUMERIC NOT NULL,
                crop_recommendation TEXT NOT NULL,
                fertilizer_advice TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database patch successful: 'simplified_advisories' configured.");
        process.exit(0);
    } catch (err) {
        console.error("Critical database provisioning error:", err);
        process.exit(1);
    }
};

createMissingTables();
