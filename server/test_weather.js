require('dotenv').config();
const pool = require('./config/db');
const weatherDataService = require('./services/weatherDataService');
const weatherScheduler = require('./services/weatherScheduler');

const runTests = async () => {
    try {
        console.log("1. Inserting test mock data for 'Delhi'...");
        // Insert data for the last 5 days
        for (let i = 1; i <= 5; i++) {
            await pool.query(`
                INSERT INTO daily_weather (location, date, rainfall, temperature, humidity)
                VALUES ($1, CURRENT_DATE - ${i}, $2, $3, $4)
                ON CONFLICT (location, date) DO NOTHING
            `, ['Delhi', 10.5, 30.0, 70.0]);
        }
        console.log("Mock data inserted.");

        console.log("2. Testing 30-day rainfall calculation...");
        const total30 = await weatherDataService.get_last_30_days_rainfall('Delhi');
        console.log(`Total 30-day rainfall for Delhi: ${total30} mm (Expected: ~52.5)`);

        console.log("3. Testing 90-day rainfall calculation...");
        const total90 = await weatherDataService.get_last_90_days_rainfall('Delhi');
        console.log(`Total 90-day rainfall for Delhi: ${total90} mm`);

        // Test the scheduler's manual run function
        console.log("4. Testing weatherScheduler (run daily job)...");
        await weatherScheduler.runDailyWeatherJob();

        console.log("Tests complete.");
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

runTests();
