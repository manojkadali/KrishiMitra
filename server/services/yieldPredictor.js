/**
 * Yield & Harvest Prediction Service
 * Estimates crop yield based on crop type, area, sowing date, soil, and weather conditions.
 */

// Base yield data (kg per acre) under optimal conditions
const BASE_YIELDS = {
    'rice':       { optimal: 2200, min: 800,  unit: 'kg', harvestDays: 120 },
    'wheat':      { optimal: 2000, min: 700,  unit: 'kg', harvestDays: 120 },
    'maize':      { optimal: 2800, min: 1000, unit: 'kg', harvestDays: 100 },
    'cotton':     { optimal: 700,  min: 200,  unit: 'kg', harvestDays: 160 },
    'sugarcane':  { optimal: 35000,min: 15000,unit: 'kg', harvestDays: 300 },
    'groundnut':  { optimal: 900,  min: 300,  unit: 'kg', harvestDays: 110 },
    'soybean':    { optimal: 1100, min: 400,  unit: 'kg', harvestDays: 100 },
    'mustard':    { optimal: 700,  min: 250,  unit: 'kg', harvestDays: 110 },
    'potato':     { optimal: 9000, min: 3000, unit: 'kg', harvestDays: 100 },
    'tomato':     { optimal: 12000,min: 4000, unit: 'kg', harvestDays: 120 },
    'onion':      { optimal: 9000, min: 3000, unit: 'kg', harvestDays: 130 },
    'chilli':     { optimal: 3500, min: 1000, unit: 'kg', harvestDays: 130 },
    'millet':     { optimal: 1400, min: 500,  unit: 'kg', harvestDays: 80 },
    'sorghum':    { optimal: 1700, min: 600,  unit: 'kg', harvestDays: 100 },
    'lentil':     { optimal: 600,  min: 200,  unit: 'kg', harvestDays: 110 },
    'chickpea':   { optimal: 800,  min: 300,  unit: 'kg', harvestDays: 100 },
    'turmeric':   { optimal: 9000, min: 3000, unit: 'kg', harvestDays: 240 },
    'banana':     { optimal: 18000,min: 6000, unit: 'kg', harvestDays: 300 },
};

// Soil suitability multipliers
const SOIL_MULTIPLIERS = {
    'rice':      { clay: 1.0, loamy: 0.9, alluvial: 1.0, 'sandy loam': 0.6, sandy: 0.4, black: 0.85, red: 0.7 },
    'wheat':     { clay: 0.85, loamy: 1.0, alluvial: 1.0, 'sandy loam': 0.8, sandy: 0.5, black: 0.9, red: 0.7 },
    'potato':    { clay: 0.6, loamy: 1.0, alluvial: 0.95, 'sandy loam': 1.0, sandy: 0.7, black: 0.7, red: 0.8 },
    'cotton':    { clay: 0.7, loamy: 0.9, alluvial: 0.9, 'sandy loam': 0.8, sandy: 0.5, black: 1.0, red: 0.7 },
};

function getSoilMultiplier(crop, soilType) {
    const cropSoil = SOIL_MULTIPLIERS[crop];
    if (!cropSoil) return 0.85; // default
    const normalized = (soilType || 'loamy').toLowerCase();
    return cropSoil[normalized] || 0.8;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

/**
 * Predict yield and harvest window for a farm
 */
exports.predictYield = (farm, weather) => {
    const crop = (farm.current_crop || '').toLowerCase();
    const cropData = BASE_YIELDS[crop] || BASE_YIELDS['wheat'];
    const area = farm.area_acres || 1;

    // Start with optimal yield
    let yieldFactor = 1.0;
    const factors = [];

    // 1. Soil factor
    const soilMult = getSoilMultiplier(crop, farm.soil_type);
    yieldFactor *= soilMult;
    if (soilMult < 0.8) {
        factors.push({ factor: 'Soil Type', impact: 'negative', detail: `${farm.soil_type} soil is not ideal for ${farm.current_crop}. Consider soil amendment.` });
    } else if (soilMult >= 0.95) {
        factors.push({ factor: 'Soil Type', impact: 'positive', detail: `${farm.soil_type} soil is excellent for ${farm.current_crop}.` });
    } else {
        factors.push({ factor: 'Soil Type', impact: 'neutral', detail: `${farm.soil_type} soil is acceptable for ${farm.current_crop}.` });
    }

    // 2. pH factor
    if (farm.soil_ph) {
        if (farm.soil_ph >= 5.5 && farm.soil_ph <= 7.5) {
            yieldFactor *= 1.0;
            factors.push({ factor: 'Soil pH', impact: 'positive', detail: `pH ${farm.soil_ph} is within the optimal range.` });
        } else if (farm.soil_ph < 5.0 || farm.soil_ph > 8.5) {
            yieldFactor *= 0.7;
            factors.push({ factor: 'Soil pH', impact: 'negative', detail: `pH ${farm.soil_ph} is outside safe range. Significant yield loss expected.` });
        } else {
            yieldFactor *= 0.85;
            factors.push({ factor: 'Soil pH', impact: 'neutral', detail: `pH ${farm.soil_ph} is slightly outside optimal range.` });
        }
    }

    // 3. Irrigation factor
    const irrigationType = (farm.irrigation_type || 'rainfed').toLowerCase();
    const irrigationMultipliers = { drip: 1.1, sprinkler: 1.0, furrow: 0.85, flood: 0.8, canal: 0.85, rainfed: 0.65 };
    const irrMult = irrigationMultipliers[irrigationType] || 0.75;
    yieldFactor *= irrMult;
    if (irrMult >= 1.0) {
        factors.push({ factor: 'Irrigation', impact: 'positive', detail: `${farm.irrigation_type || 'Rainfed'} irrigation is efficient for this crop.` });
    } else if (irrMult < 0.8) {
        factors.push({ factor: 'Irrigation', impact: 'negative', detail: `${farm.irrigation_type || 'Rainfed'} may limit yield. Consider upgrading irrigation.` });
    } else {
        factors.push({ factor: 'Irrigation', impact: 'neutral', detail: `${farm.irrigation_type || 'Rainfed'} irrigation is adequate.` });
    }

    // 4. Weather factor
    if (weather) {
        if (weather.temperature > 40) {
            yieldFactor *= 0.7;
            factors.push({ factor: 'Temperature', impact: 'negative', detail: `Extreme heat (${weather.temperature}°C) will reduce yield significantly.` });
        } else if (weather.temperature > 35) {
            yieldFactor *= 0.85;
            factors.push({ factor: 'Temperature', impact: 'negative', detail: `High temperature (${weather.temperature}°C) may stress the crop.` });
        } else {
            factors.push({ factor: 'Temperature', impact: 'positive', detail: `Temperature (${weather.temperature}°C) is within acceptable range.` });
        }

        if (weather.forecastRainfall > 50) {
            yieldFactor *= 0.8;
            factors.push({ factor: 'Rainfall', impact: 'negative', detail: 'Heavy rainfall may cause waterlogging and crop damage.' });
        } else if (weather.forecastRainfall > 10) {
            factors.push({ factor: 'Rainfall', impact: 'positive', detail: 'Moderate rainfall expected — beneficial for crops.' });
        }
    }

    // 5. Sowing timing factor
    if (farm.sowing_date) {
        const month = new Date(farm.sowing_date).getMonth();
        // Simple season check (kharif: Jun-Sep, rabi: Oct-Feb)
        const kharifCrops = ['rice', 'cotton', 'maize', 'sugarcane', 'groundnut', 'soybean', 'millet', 'sorghum', 'chilli', 'turmeric'];
        const rabiCrops = ['wheat', 'mustard', 'potato', 'lentil', 'chickpea', 'onion'];

        const isKharifSeason = month >= 5 && month <= 8;
        const isRabiSeason = month >= 9 || month <= 1;

        if (kharifCrops.includes(crop) && !isKharifSeason) {
            yieldFactor *= 0.8;
            factors.push({ factor: 'Sowing Season', impact: 'negative', detail: `${farm.current_crop} is typically a Kharif crop but was sown outside the optimal window.` });
        } else if (rabiCrops.includes(crop) && !isRabiSeason) {
            yieldFactor *= 0.8;
            factors.push({ factor: 'Sowing Season', impact: 'negative', detail: `${farm.current_crop} is typically a Rabi crop but was sown outside the optimal window.` });
        } else {
            factors.push({ factor: 'Sowing Season', impact: 'positive', detail: 'Crop was sown in the appropriate season.' });
        }
    }

    // Calculate final yield
    yieldFactor = Math.max(0.3, Math.min(1.15, yieldFactor));
    const yieldPerAcre = Math.round(cropData.optimal * yieldFactor);
    const totalYield = Math.round(yieldPerAcre * area);

    // Confidence level
    let confidence = 'Medium';
    if (weather && farm.soil_ph && farm.sowing_date && farm.irrigation_type) {
        confidence = 'High';
    } else if (!weather && !farm.soil_ph) {
        confidence = 'Low';
    }

    // Harvest window calculation
    let harvestStart = null;
    let harvestEnd = null;
    if (farm.sowing_date) {
        harvestStart = addDays(farm.sowing_date, cropData.harvestDays - 7);
        harvestEnd = addDays(farm.sowing_date, cropData.harvestDays + 14);
    }

    return {
        crop: farm.current_crop,
        area_acres: area,
        predicted_yield_kg: totalYield,
        yield_per_acre: yieldPerAcre,
        optimal_yield_per_acre: cropData.optimal,
        yield_percentage: Math.round(yieldFactor * 100),
        confidence,
        harvest_window_start: harvestStart,
        harvest_window_end: harvestEnd,
        harvest_days: cropData.harvestDays,
        factors,
        unit: cropData.unit,
    };
};
