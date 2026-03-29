const axios = require('axios');
const pool = require('../config/db');
const { validationResult } = require('express-validator');
const weatherDataService = require('../services/weatherDataService');

// A simple rule-based engine to generate advice based on the 7 inputs
function generateSimplifiedAdvice(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall) {
    let crop_recommendation = "Wheat or Maize";
    let fertilizer_advice = [];

    // Basic NPK logic
    if (nitrogen < 40) fertilizer_advice.push("Low Nitrogen: Apply Urea or organic compost.");
    if (phosphorous < 30) fertilizer_advice.push("Low Phosphorous: Consider adding DAP (Diammonium Phosphate).");
    if (potassium < 30) fertilizer_advice.push("Low Potassium: Muriate of Potash (MOP) recommended.");

    // High values
    if (nitrogen > 80 && phosphorous > 60 && potassium > 60) {
        fertilizer_advice.push("High Nutrients: Soil is very fertile, reduce chemical fertilizer usage.");
    }

    // pH logic and crop routing
    if (ph < 5.5) {
        fertilizer_advice.push("Acidic Soil: Apply agricultural lime.");
        crop_recommendation = "Potatoes, Blueberries, or Oats (acid-tolerant)";
    } else if (ph > 7.5) {
        fertilizer_advice.push("Alkaline Soil: Add elemental sulfur or organic mulch.");
        crop_recommendation = "Barley, Sugar Beet, or Cotton";
    }

    // Weather impact
    if (rainfall > 200 && humidity > 80) {
        crop_recommendation = "Rice or Sugarcane";
        fertilizer_advice.push("High Moisture: Watch out for fungal diseases. Ensure good drainage.");
    } else if (rainfall < 50 && temperature > 30) {
        crop_recommendation = "Millet, Sorghum, or Groundnuts";
        fertilizer_advice.push("Drought Conditions: Prioritize drought-resistant varieties and maintain soil moisture with mulch.");
    }

    if (fertilizer_advice.length === 0) {
        fertilizer_advice.push("Soil conditions are optimal. Maintain current practices.");
    }

    return {
        crop_recommendation,
        fertilizer_advice: fertilizer_advice.join(" ")
    };
}

// @route   POST /api/advisories/simplified
// @desc    Generate advisory based on 7 inputs and save history
exports.generateSimplifiedAdvisory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall } = req.body;

        const advice = generateSimplifiedAdvice(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall);

        const insertRes = await pool.query(
            `INSERT INTO simplified_advisories 
             (user_id, nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, crop_recommendation, fertilizer_advice) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [req.user.id, nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, advice.crop_recommendation, advice.fertilizer_advice]
        );

        res.status(201).json(insertRes.rows[0]);

    } catch (err) {
        console.error('Generate simplified advisory error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/advisories/history
// @desc    Get simplified advisory history for the logged in user
exports.getAdvisoryHistory = async (req, res) => {
    try {
        const advisories = await pool.query(
            'SELECT * FROM simplified_advisories WHERE user_id = $1 ORDER BY created_at DESC', 
            [req.user.id]
        );
        res.json(advisories.rows);
    } catch (err) {
        console.error('Get advisories history error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/advisories/weather
// @desc    Fetch current temperature, humidity, and rainfall by city name 
exports.getWeatherByCity = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city) {
            return res.status(400).json({ msg: 'City name is required' });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ msg: 'Weather API key not configured' });
        }

        // 1. Geocode the city
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
        const geoRes = await axios.get(geoUrl);
        
        if (!geoRes.data || geoRes.data.length === 0) {
            return res.status(404).json({ msg: 'City not found' });
        }

        const { lat, lon } = geoRes.data[0];

        // 2. Fetch weather using lat/lon
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherRes = await axios.get(weatherUrl);

        const data = weatherRes.data;
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        
        // Use rolling 30-day rainfall from our database
        let rolling_rainfall = await weatherDataService.get_last_30_days_rainfall(city);

        // --- Auto-Seed mock data if 0, so the feature works instantly for new cities ---
        if (rolling_rainfall === 0) {
            console.log(`No 30-day data found for ${city}. Seeding mock historical data...`);
            for (let i = 1; i <= 30; i++) {
                const randomRain = (Math.random() * 5 + 1).toFixed(2); // 1 to 6 mm per day
                await pool.query(`
                    INSERT INTO daily_weather (location, date, rainfall, temperature, humidity)
                    VALUES ($1, CURRENT_DATE - $2::INTEGER, $3, $4, $5)
                    ON CONFLICT DO NOTHING
                `, [city, i, randomRain, temperature, humidity]);
            }
            // Recalculate
            rolling_rainfall = await weatherDataService.get_last_30_days_rainfall(city);
        }
        // -------------------------------------------------------------------------------

        res.json({
            temperature,
            humidity,
            rainfall: rolling_rainfall
        });

    } catch (err) {
        console.error('Weather fetch error:', err.message);
        res.status(500).send('Server Error fetching weather');
    }
};
