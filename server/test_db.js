require('dotenv').config();
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function recreateDB() {
    try {
        console.log('Dropping conflicting public tables...');
        await pool.query('DROP TABLE IF EXISTS advisories CASCADE');
        await pool.query('DROP TABLE IF EXISTS disease_reports CASCADE');
        await pool.query('DROP TABLE IF EXISTS farms CASCADE');
        await pool.query('DROP TABLE IF EXISTS market_prices CASCADE');
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        console.log('Tables dropped.');

        console.log('Re-initializing clean schema...');
        const sql = fs.readFileSync(path.join(__dirname, 'models', 'db.sql'), 'utf8');
        await pool.query(sql);

        console.log('Database strictly initialized from db.sql.');
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        pool.end();
    }
}
recreateDB();
