/**
 * Crop Recommendation Engine
 * Rule-based crop recommendation using soil NPK, pH, weather, and region data.
 */

// Crop database with optimal growing conditions
const CROP_DATABASE = [
    { name: 'Rice', minN: 60, maxN: 120, minP: 30, maxP: 60, minK: 30, maxK: 60, minTemp: 20, maxTemp: 35, minHumidity: 60, maxHumidity: 95, minPH: 5.0, maxPH: 7.0, minRainfall: 150, maxRainfall: 400, soilTypes: ['clay', 'loamy', 'alluvial'], seasons: ['kharif'], yieldPerAcre: 2000 },
    { name: 'Wheat', minN: 40, maxN: 100, minP: 25, maxP: 55, minK: 20, maxK: 50, minTemp: 10, maxTemp: 25, minHumidity: 30, maxHumidity: 70, minPH: 6.0, maxPH: 7.5, minRainfall: 50, maxRainfall: 150, soilTypes: ['loamy', 'clay', 'alluvial'], seasons: ['rabi'], yieldPerAcre: 1800 },
    { name: 'Maize', minN: 60, maxN: 120, minP: 30, maxP: 60, minK: 20, maxK: 50, minTemp: 18, maxTemp: 32, minHumidity: 40, maxHumidity: 80, minPH: 5.5, maxPH: 7.5, minRainfall: 60, maxRainfall: 200, soilTypes: ['loamy', 'sandy loam', 'alluvial'], seasons: ['kharif', 'rabi'], yieldPerAcre: 2500 },
    { name: 'Cotton', minN: 40, maxN: 80, minP: 20, maxP: 50, minK: 20, maxK: 50, minTemp: 21, maxTemp: 35, minHumidity: 40, maxHumidity: 75, minPH: 6.0, maxPH: 8.0, minRainfall: 50, maxRainfall: 150, soilTypes: ['black', 'loamy', 'alluvial'], seasons: ['kharif'], yieldPerAcre: 600 },
    { name: 'Sugarcane', minN: 80, maxN: 160, minP: 40, maxP: 80, minK: 40, maxK: 80, minTemp: 20, maxTemp: 38, minHumidity: 60, maxHumidity: 90, minPH: 5.5, maxPH: 7.5, minRainfall: 150, maxRainfall: 350, soilTypes: ['loamy', 'alluvial', 'clay'], seasons: ['kharif'], yieldPerAcre: 30000 },
    { name: 'Groundnut', minN: 20, maxN: 50, minP: 30, maxP: 60, minK: 20, maxK: 40, minTemp: 25, maxTemp: 35, minHumidity: 40, maxHumidity: 70, minPH: 5.5, maxPH: 7.0, minRainfall: 50, maxRainfall: 150, soilTypes: ['sandy loam', 'loamy', 'red'], seasons: ['kharif', 'rabi'], yieldPerAcre: 800 },
    { name: 'Soybean', minN: 20, maxN: 60, minP: 30, maxP: 70, minK: 20, maxK: 50, minTemp: 20, maxTemp: 30, minHumidity: 50, maxHumidity: 80, minPH: 5.5, maxPH: 7.0, minRainfall: 60, maxRainfall: 200, soilTypes: ['loamy', 'clay', 'black'], seasons: ['kharif'], yieldPerAcre: 1000 },
    { name: 'Mustard', minN: 30, maxN: 70, minP: 20, maxP: 50, minK: 15, maxK: 40, minTemp: 10, maxTemp: 25, minHumidity: 30, maxHumidity: 60, minPH: 6.0, maxPH: 7.5, minRainfall: 30, maxRainfall: 100, soilTypes: ['loamy', 'sandy loam', 'alluvial'], seasons: ['rabi'], yieldPerAcre: 600 },
    { name: 'Potato', minN: 50, maxN: 100, minP: 40, maxP: 80, minK: 40, maxK: 80, minTemp: 15, maxTemp: 25, minHumidity: 50, maxHumidity: 80, minPH: 4.5, maxPH: 6.5, minRainfall: 50, maxRainfall: 150, soilTypes: ['sandy loam', 'loamy', 'alluvial'], seasons: ['rabi'], yieldPerAcre: 8000 },
    { name: 'Tomato', minN: 60, maxN: 120, minP: 40, maxP: 80, minK: 40, maxK: 80, minTemp: 18, maxTemp: 30, minHumidity: 40, maxHumidity: 70, minPH: 5.5, maxPH: 7.0, minRainfall: 40, maxRainfall: 150, soilTypes: ['loamy', 'sandy loam', 'red'], seasons: ['kharif', 'rabi'], yieldPerAcre: 10000 },
    { name: 'Onion', minN: 40, maxN: 80, minP: 30, maxP: 60, minK: 30, maxK: 60, minTemp: 15, maxTemp: 30, minHumidity: 40, maxHumidity: 70, minPH: 6.0, maxPH: 7.5, minRainfall: 40, maxRainfall: 100, soilTypes: ['loamy', 'sandy loam', 'alluvial'], seasons: ['rabi', 'kharif'], yieldPerAcre: 8000 },
    { name: 'Chilli', minN: 50, maxN: 100, minP: 30, maxP: 60, minK: 30, maxK: 60, minTemp: 20, maxTemp: 35, minHumidity: 50, maxHumidity: 80, minPH: 5.5, maxPH: 7.0, minRainfall: 60, maxRainfall: 200, soilTypes: ['loamy', 'sandy loam', 'black'], seasons: ['kharif'], yieldPerAcre: 3000 },
    { name: 'Millet', minN: 20, maxN: 60, minP: 15, maxP: 40, minK: 15, maxK: 40, minTemp: 25, maxTemp: 40, minHumidity: 20, maxHumidity: 60, minPH: 5.5, maxPH: 7.5, minRainfall: 20, maxRainfall: 80, soilTypes: ['sandy', 'sandy loam', 'red', 'loamy'], seasons: ['kharif'], yieldPerAcre: 1200 },
    { name: 'Sorghum', minN: 30, maxN: 80, minP: 20, maxP: 50, minK: 15, maxK: 40, minTemp: 25, maxTemp: 38, minHumidity: 25, maxHumidity: 65, minPH: 5.5, maxPH: 8.0, minRainfall: 30, maxRainfall: 100, soilTypes: ['black', 'loamy', 'red', 'sandy loam'], seasons: ['kharif', 'rabi'], yieldPerAcre: 1500 },
    { name: 'Lentil', minN: 15, maxN: 40, minP: 20, maxP: 50, minK: 20, maxK: 40, minTemp: 10, maxTemp: 25, minHumidity: 30, maxHumidity: 60, minPH: 6.0, maxPH: 7.5, minRainfall: 30, maxRainfall: 100, soilTypes: ['loamy', 'clay', 'alluvial'], seasons: ['rabi'], yieldPerAcre: 500 },
    { name: 'Chickpea', minN: 15, maxN: 40, minP: 25, maxP: 60, minK: 20, maxK: 40, minTemp: 15, maxTemp: 30, minHumidity: 30, maxHumidity: 60, minPH: 6.0, maxPH: 7.5, minRainfall: 30, maxRainfall: 100, soilTypes: ['loamy', 'sandy loam', 'black'], seasons: ['rabi'], yieldPerAcre: 700 },
    { name: 'Turmeric', minN: 40, maxN: 100, minP: 20, maxP: 50, minK: 40, maxK: 80, minTemp: 20, maxTemp: 35, minHumidity: 60, maxHumidity: 90, minPH: 5.0, maxPH: 7.5, minRainfall: 150, maxRainfall: 350, soilTypes: ['loamy', 'clay', 'alluvial', 'red'], seasons: ['kharif'], yieldPerAcre: 8000 },
    { name: 'Banana', minN: 80, maxN: 150, minP: 30, maxP: 60, minK: 60, maxK: 120, minTemp: 20, maxTemp: 35, minHumidity: 60, maxHumidity: 90, minPH: 5.5, maxPH: 7.0, minRainfall: 100, maxRainfall: 300, soilTypes: ['loamy', 'alluvial', 'clay'], seasons: ['kharif', 'rabi'], yieldPerAcre: 15000 },
];

function scoreMatch(value, min, max) {
    if (value >= min && value <= max) return 1.0;
    const range = max - min;
    if (value < min) return Math.max(0, 1 - (min - value) / (range || 1));
    return Math.max(0, 1 - (value - max) / (range || 1));
}

/**
 * Recommend crops based on soil, weather, and optional soil type
 */
exports.recommendCrops = (inputs) => {
    const { nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall, soil_type } = inputs;

    const results = CROP_DATABASE.map(crop => {
        let score = 0;
        let maxScore = 7;

        score += scoreMatch(nitrogen, crop.minN, crop.maxN);
        score += scoreMatch(phosphorous, crop.minP, crop.maxP);
        score += scoreMatch(potassium, crop.minK, crop.maxK);
        score += scoreMatch(temperature, crop.minTemp, crop.maxTemp);
        score += scoreMatch(humidity, crop.minHumidity, crop.maxHumidity);
        score += scoreMatch(ph, crop.minPH, crop.maxPH);
        score += scoreMatch(rainfall, crop.minRainfall, crop.maxRainfall);

        // Bonus for soil type match
        if (soil_type) {
            maxScore = 8;
            const normalizedSoil = soil_type.toLowerCase();
            if (crop.soilTypes.some(s => normalizedSoil.includes(s))) {
                score += 1.0;
            }
        }

        const matchPercent = Math.round((score / maxScore) * 100);

        return {
            crop: crop.name,
            matchPercent,
            seasons: crop.seasons,
            idealConditions: {
                nitrogen: `${crop.minN}-${crop.maxN}`,
                phosphorous: `${crop.minP}-${crop.maxP}`,
                potassium: `${crop.minK}-${crop.maxK}`,
                temperature: `${crop.minTemp}-${crop.maxTemp}°C`,
                humidity: `${crop.minHumidity}-${crop.maxHumidity}%`,
                ph: `${crop.minPH}-${crop.maxPH}`,
                rainfall: `${crop.minRainfall}-${crop.maxRainfall}mm`,
            },
            soilTypes: crop.soilTypes,
            yieldPerAcre: crop.yieldPerAcre,
        };
    });

    results.sort((a, b) => b.matchPercent - a.matchPercent);

    return results.slice(0, 8);
};
