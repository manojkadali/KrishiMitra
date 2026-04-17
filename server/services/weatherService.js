const axios = require('axios');

// In-memory cache for weather data
// Key format: `${lat}_${lon}`
// Value format: { data: weatherResponse, timestamp: Date.now() }
const weatherCache = {};
const CACHE_VALIDITY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetches weather utilizing lat/lon or district+state
 * Implements graceful degradation: returns null on failure instead of throwing.
 */
exports.getWeather = async (farm) => {
    try {
        let lat = farm.latitude;
        let lon = farm.longitude;

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            console.warn("OPENWEATHER_API_KEY is missing. Skipping weather.");
            return null;
        }

        // Geocoding fallback if no lat/lon but district/state present
        if (!lat || !lon) {
            if (farm.district && farm.state) {
                const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${farm.district},${farm.state},IN&limit=1&appid=${apiKey}`;
                const geoRes = await axios.get(geoUrl);
                if (geoRes.data && geoRes.data.length > 0) {
                    lat = geoRes.data[0].lat;
                    lon = geoRes.data[0].lon;
                } else {
                    console.warn(`Geocoding failed for ${farm.district}, ${farm.state}. Skipping weather.`);
                    return null;
                }
            } else {
                console.warn("No location data available for farm. Skipping weather.");
                return null;
            }
        }

        const cacheKey = `${lat}_${lon}`;
        const now = Date.now();

        // Check Cache
        if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp < CACHE_VALIDITY_MS)) {
            console.log(`Returning cached weather for ${cacheKey}`);
            return weatherCache[cacheKey].data;
        }

        // Fetch new data
        console.log(`Fetching new weather data for ${lat}, ${lon} from OpenWeather API`);
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherRes = await axios.get(weatherUrl);

        const weatherData = {
            temperature: weatherRes.data.main.temp,
            humidity: weatherRes.data.main.humidity,
            forecastRainfall: weatherRes.data.rain ? weatherRes.data.rain['1h'] || weatherRes.data.rain['3h'] || 0 : 0,
            description: weatherRes.data.weather[0].description
        };

        // Cache the result
        weatherCache[cacheKey] = {
            data: weatherData,
            timestamp: now,
        };

        return weatherData;
    } catch (err) {
        console.error("Weather API Error:", err.message, "- Graceful degradation applied (returning null).");
        return null;
    }
};
