require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function initDb() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'models', 'db.sql'), 'utf8');
        await pool.query(sql);
        console.log('Database tables initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        process.exit();
    }
}

initDb();
