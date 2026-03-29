const cron = require('node-cron');
const axios = require('axios');
const pool = require('../config/db');

/**
 * Fetch unique active locations.
 * In a real app, this could be from farms table or users table.
 * Let's extract unique non-null districts from farms.
 */
const getUniqueLocations = async () => {
    try {
        const res = await pool.query('SELECT DISTINCT district FROM farms WHERE district IS NOT NULL');
        return res.rows.map(row => row.district);
    } catch (err) {
        console.error("Error fetching locations from farms:", err.message);
        return [];
    }
};

/**
 * Fetch weather data for a location and save it to the database.
 */
const fetchAndStoreWeather = async (location) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.warn("OPENWEATHER_API_KEY is missing. Cannot fetch daily weather.");
        return;
    }

    let lat, lon;
    let temperature = null;
    let humidity = null;
    let rainfall = 0;
    let api_failed = false;

    try {
        // Step 1: Geocoding
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
        const geoRes = await axios.get(geoUrl);
        
        if (geoRes.data && geoRes.data.length > 0) {
            lat = geoRes.data[0].lat;
            lon = geoRes.data[0].lon;

            // Step 2: Fetch weather
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            const weatherRes = await axios.get(weatherUrl);
            
            temperature = weatherRes.data.main.temp;
            humidity = weatherRes.data.main.humidity;
            rainfall = weatherRes.data.rain ? (weatherRes.data.rain['1h'] || weatherRes.data.rain['3h'] || 0) : 0;
        } else {
            // Geocoding failed
            api_failed = true;
        }
    } catch (err) {
        console.error(`Error fetching weather for ${location}:`, err.message);
        // Implement 1 retry logic
        console.log(`Retrying fetch for ${location} in 5 seconds...`);
        try {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const reGeoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
            const reGeoRes = await axios.get(reGeoUrl);
            if (reGeoRes.data && reGeoRes.data.length > 0) {
                lat = reGeoRes.data[0].lat;
                lon = reGeoRes.data[0].lon;
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
                const weatherRes = await axios.get(weatherUrl);
                temperature = weatherRes.data.main.temp;
                humidity = weatherRes.data.main.humidity;
                rainfall = weatherRes.data.rain ? (weatherRes.data.rain['1h'] || weatherRes.data.rain['3h'] || 0) : 0;
            } else {
                api_failed = true;
            }
        } catch (retryErr) {
            console.error(`Retry failed for ${location}:`, retryErr.message);
            api_failed = true;
        }
    }

    // Insert into PostgreSQL
    try {
        const query = `
            INSERT INTO daily_weather (location, date, rainfall, temperature, humidity, api_failed)
            VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
            ON CONFLICT (location, date) 
            DO UPDATE SET 
                rainfall = EXCLUDED.rainfall,
                temperature = EXCLUDED.temperature,
                humidity = EXCLUDED.humidity,
                api_failed = EXCLUDED.api_failed
        `;
        
        await pool.query(query, [
            location, 
            rainfall, 
            temperature, 
            humidity, 
            api_failed
        ]);
        console.log(`Saved daily weather for ${location} today.`);
    } catch (dbErr) {
        console.error(`DB Insert Error for ${location}:`, dbErr.message);
    }
};

/**
 * Job that runs daily to collect weather data
 */
const runDailyWeatherJob = async () => {
    console.log("Starting daily weather data collection job...");
    const locations = await getUniqueLocations();
    
    if (locations.length === 0) {
        console.log("No locations found to fetch weather for.");
        return;
    }

    for (const loc of locations) {
        await fetchAndStoreWeather(loc);
        // Small delay to prevent hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
    console.log("Finished daily weather data collection.");
};

// Expose schedule method
exports.startScheduler = () => {
    // Schedule to run at midnight every day
    cron.schedule('0 0 * * *', () => {
        runDailyWeatherJob();
    });
    console.log("Weather scheduler registered.");
};

// Exporting manual run for testing purposes
exports.runDailyWeatherJob = runDailyWeatherJob;
