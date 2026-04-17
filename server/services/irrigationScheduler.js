/**
 * Irrigation Scheduler Service
 * Generates watering schedules based on crop, soil, irrigation type, weather, and sowing date.
 */

// Crop water requirements (mm per day at different growth stages)
const CROP_WATER_NEEDS = {
    'rice':       { seedling: 6, vegetative: 8, flowering: 10, maturity: 5, totalDays: 120, waterCritical: 'flowering' },
    'wheat':      { seedling: 3, vegetative: 4, flowering: 5, maturity: 3, totalDays: 120, waterCritical: 'flowering' },
    'maize':      { seedling: 3, vegetative: 5, flowering: 7, maturity: 4, totalDays: 100, waterCritical: 'flowering' },
    'cotton':     { seedling: 3, vegetative: 5, flowering: 6, maturity: 4, totalDays: 160, waterCritical: 'flowering' },
    'sugarcane':  { seedling: 5, vegetative: 7, flowering: 8, maturity: 5, totalDays: 300, waterCritical: 'vegetative' },
    'groundnut':  { seedling: 3, vegetative: 4, flowering: 5, maturity: 3, totalDays: 110, waterCritical: 'flowering' },
    'soybean':    { seedling: 3, vegetative: 4, flowering: 5, maturity: 3, totalDays: 100, waterCritical: 'flowering' },
    'mustard':    { seedling: 2, vegetative: 3, flowering: 4, maturity: 2, totalDays: 110, waterCritical: 'flowering' },
    'potato':     { seedling: 3, vegetative: 5, flowering: 6, maturity: 3, totalDays: 100, waterCritical: 'vegetative' },
    'tomato':     { seedling: 3, vegetative: 5, flowering: 6, maturity: 4, totalDays: 120, waterCritical: 'flowering' },
    'onion':      { seedling: 3, vegetative: 4, flowering: 5, maturity: 2, totalDays: 130, waterCritical: 'vegetative' },
    'chilli':     { seedling: 3, vegetative: 4, flowering: 5, maturity: 3, totalDays: 130, waterCritical: 'flowering' },
    'millet':     { seedling: 2, vegetative: 3, flowering: 4, maturity: 2, totalDays: 80, waterCritical: 'flowering' },
    'sorghum':    { seedling: 2, vegetative: 3, flowering: 4, maturity: 2, totalDays: 100, waterCritical: 'flowering' },
    'lentil':     { seedling: 2, vegetative: 3, flowering: 3, maturity: 2, totalDays: 110, waterCritical: 'flowering' },
    'chickpea':   { seedling: 2, vegetative: 3, flowering: 3, maturity: 2, totalDays: 100, waterCritical: 'flowering' },
    'turmeric':   { seedling: 4, vegetative: 5, flowering: 6, maturity: 3, totalDays: 240, waterCritical: 'vegetative' },
    'banana':     { seedling: 5, vegetative: 7, flowering: 8, maturity: 5, totalDays: 300, waterCritical: 'flowering' },
};

// Soil water retention factor (higher = retains more water, needs less frequent irrigation)
const SOIL_RETENTION = {
    'clay': 1.3,
    'loamy': 1.0,
    'sandy loam': 0.8,
    'sandy': 0.6,
    'black': 1.2,
    'red': 0.85,
    'alluvial': 1.0,
    'laterite': 0.75,
};

// Irrigation efficiency factor
const IRRIGATION_EFFICIENCY = {
    'drip': 0.90,
    'sprinkler': 0.75,
    'flood': 0.50,
    'furrow': 0.60,
    'canal': 0.55,
    'rainfed': 0.30,
};

function getGrowthStage(sowingDate) {
    if (!sowingDate) return { stage: 'vegetative', daysSinceSowing: 30 };
    const days = Math.floor((new Date() - new Date(sowingDate)) / (1000 * 60 * 60 * 24));
    if (days < 20) return { stage: 'seedling', daysSinceSowing: days };
    if (days < 60) return { stage: 'vegetative', daysSinceSowing: days };
    if (days < 90) return { stage: 'flowering', daysSinceSowing: days };
    return { stage: 'maturity', daysSinceSowing: days };
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

/**
 * Generate an irrigation schedule for a farm
 */
exports.generateSchedule = (farm, weather) => {
    const crop = (farm.current_crop || '').toLowerCase();
    const cropData = CROP_WATER_NEEDS[crop] || CROP_WATER_NEEDS['wheat']; // default to wheat
    const soilFactor = SOIL_RETENTION[(farm.soil_type || 'loamy').toLowerCase()] || 1.0;
    const irrigationEff = IRRIGATION_EFFICIENCY[(farm.irrigation_type || 'flood').toLowerCase()] || 0.55;

    const { stage, daysSinceSowing } = getGrowthStage(farm.sowing_date);
    const baseWaterNeed = cropData[stage] || 4; // mm/day

    // Adjust for weather
    let weatherAdjust = 1.0;
    let weatherNote = '';
    if (weather) {
        if (weather.temperature > 35) {
            weatherAdjust = 1.3;
            weatherNote = 'High temperature — increase irrigation frequency.';
        } else if (weather.temperature > 30) {
            weatherAdjust = 1.15;
        }
        if (weather.humidity > 80) {
            weatherAdjust *= 0.85;
            weatherNote += ' High humidity — slightly reduce water.';
        }
        if (weather.forecastRainfall > 20) {
            weatherAdjust *= 0.5;
            weatherNote += ' Rainfall expected — skip or reduce irrigation.';
        }
    }

    const effectiveWaterNeed = baseWaterNeed * weatherAdjust / soilFactor;
    const waterPerSession = Math.round(effectiveWaterNeed / irrigationEff * 10) / 10; // mm per session

    // Compute interval between irrigations
    let intervalDays;
    if (effectiveWaterNeed <= 2) intervalDays = 7;
    else if (effectiveWaterNeed <= 4) intervalDays = 5;
    else if (effectiveWaterNeed <= 6) intervalDays = 3;
    else intervalDays = 2;

    // Adjust interval based on irrigation type
    if (farm.irrigation_type === 'drip') intervalDays = Math.max(1, intervalDays - 1);
    if (farm.irrigation_type === 'flood') intervalDays = Math.max(intervalDays, 4);

    // Generate next 4 weeks of schedule
    const today = new Date().toISOString().split('T')[0];
    const schedule = [];
    let currentDate = today;

    for (let i = 0; i < 28; i += intervalDays) {
        const scheduleDate = addDays(today, i);
        const isRainy = weather && weather.forecastRainfall > 20 && i === 0;

        schedule.push({
            date: scheduleDate,
            waterAmountMM: isRainy ? 0 : waterPerSession,
            status: isRainy ? 'skip' : 'scheduled',
            note: isRainy ? 'Rainfall expected — skip this session' : `Apply ~${waterPerSession}mm of water`,
        });
    }

    // Compute harvest estimate
    const daysRemaining = Math.max(0, cropData.totalDays - daysSinceSowing);
    const estimatedHarvest = farm.sowing_date ? addDays(farm.sowing_date, cropData.totalDays) : null;

    return {
        crop: farm.current_crop,
        growthStage: stage,
        daysSinceSowing,
        soilType: farm.soil_type,
        irrigationType: farm.irrigation_type || 'flood',
        dailyWaterNeedMM: Math.round(effectiveWaterNeed * 10) / 10,
        waterPerSessionMM: waterPerSession,
        intervalDays,
        criticalStage: cropData.waterCritical,
        isCriticalNow: stage === cropData.waterCritical,
        weatherNote: weatherNote.trim(),
        schedule,
        estimatedHarvestDate: estimatedHarvest,
        daysToHarvest: daysRemaining,
        nextIrrigation: schedule.length > 0 ? schedule[0].date : today,
    };
};
