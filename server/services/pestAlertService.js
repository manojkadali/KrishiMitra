/**
 * Pest & Disease Alert Service
 * Proactive alerts based on weather conditions + crop vulnerability patterns.
 */

// Crop-specific pest/disease risk rules
const PEST_DISEASE_RULES = [
    // Rice diseases
    { crop: 'rice', pest: 'Rice Blast', type: 'fungal', condition: (w) => w.humidity > 80 && w.temperature >= 20 && w.temperature <= 30, severity: 'HIGH', message: 'High humidity + warm temperature = elevated risk for Rice Blast. Monitor leaf spots and apply fungicide if early symptoms appear.' },
    { crop: 'rice', pest: 'Bacterial Leaf Blight', type: 'bacterial', condition: (w) => w.humidity > 85 && w.forecastRainfall > 15, severity: 'HIGH', message: 'Wet conditions favor Bacterial Leaf Blight. Avoid excess nitrogen application and ensure proper drainage.' },
    { crop: 'rice', pest: 'Brown Plant Hopper', type: 'pest', condition: (w) => w.humidity > 75 && w.temperature >= 25 && w.temperature <= 35, severity: 'MEDIUM', message: 'Conditions favorable for Brown Plant Hopper infestation. Monitor plant bases and avoid excessive use of broad-spectrum insecticides.' },

    // Wheat diseases
    { crop: 'wheat', pest: 'Wheat Rust', type: 'fungal', condition: (w) => w.humidity > 70 && w.temperature >= 15 && w.temperature <= 25, severity: 'HIGH', message: 'Moderate temperature with high humidity creates ideal conditions for Wheat Rust. Inspect leaves for orange-brown pustules.' },
    { crop: 'wheat', pest: 'Powdery Mildew', type: 'fungal', condition: (w) => w.humidity > 60 && w.temperature >= 15 && w.temperature <= 22, severity: 'MEDIUM', message: 'Cool humid conditions favor Powdery Mildew development. Improve air circulation and consider sulfur-based fungicide.' },
    { crop: 'wheat', pest: 'Aphids', type: 'pest', condition: (w) => w.temperature >= 15 && w.temperature <= 25 && w.humidity < 60, severity: 'MEDIUM', message: 'Conditions are favorable for wheat aphid populations. Monitor undersides of leaves and consider neem-based spray.' },

    // Cotton diseases
    { crop: 'cotton', pest: 'Bollworm', type: 'pest', condition: (w) => w.temperature >= 25 && w.temperature <= 35 && w.humidity >= 50, severity: 'HIGH', message: 'Warm humid weather is ideal for Bollworm activity. Install pheromone traps and inspect bolls for entry holes.' },
    { crop: 'cotton', pest: 'Cotton Leaf Curl Virus', type: 'viral', condition: (w) => w.temperature >= 28 && w.humidity >= 60, severity: 'CRITICAL', message: 'Weather favors whitefly (vector for Leaf Curl Virus). Implement whitefly management immediately with neem or imidacloprid.' },
    { crop: 'cotton', pest: 'Grey Mildew', type: 'fungal', condition: (w) => w.humidity > 80 && w.temperature >= 22 && w.temperature <= 30, severity: 'MEDIUM', message: 'High moisture conditions increase Grey Mildew risk. Ensure adequate spacing and apply copper-based fungicide.' },

    // Tomato diseases
    { crop: 'tomato', pest: 'Early Blight', type: 'fungal', condition: (w) => w.humidity > 70 && w.temperature >= 20 && w.temperature <= 30, severity: 'HIGH', message: 'Warm humid weather triggers Early Blight risk. Remove lower affected leaves and apply mancozeb or chlorothalonil fungicide.' },
    { crop: 'tomato', pest: 'Late Blight', type: 'fungal', condition: (w) => w.humidity > 85 && w.temperature >= 15 && w.temperature <= 22 && w.forecastRainfall > 10, severity: 'CRITICAL', message: 'Cool, wet conditions are highly conducive to Late Blight. Apply metalaxyl-based fungicide immediately as prevention.' },
    { crop: 'tomato', pest: 'Tomato Yellow Leaf Curl Virus', type: 'viral', condition: (w) => w.temperature >= 25 && w.humidity >= 60, severity: 'HIGH', message: 'Whitefly activity expected in warm humid conditions. Use yellow sticky traps and neem spray to control vector population.' },
    { crop: 'tomato', pest: 'Spider Mites', type: 'pest', condition: (w) => w.temperature > 30 && w.humidity < 50, severity: 'MEDIUM', message: 'Hot dry conditions favor spider mite outbreaks. Increase irrigation and apply insecticidal soap or neem oil.' },

    // Potato diseases
    { crop: 'potato', pest: 'Late Blight', type: 'fungal', condition: (w) => w.humidity > 80 && w.temperature >= 12 && w.temperature <= 22 && w.forecastRainfall > 5, severity: 'CRITICAL', message: 'Potato Late Blight risk is CRITICAL. Cool, wet weather is the primary trigger. Apply copper-based fungicide preventively.' },
    { crop: 'potato', pest: 'Early Blight', type: 'fungal', condition: (w) => w.humidity > 65 && w.temperature >= 20 && w.temperature <= 30, severity: 'HIGH', message: 'Early Blight conditions detected. Alternate mancozeb and chlorothalonil applications every 7-10 days.' },

    // Maize diseases
    { crop: 'maize', pest: 'Fall Armyworm', type: 'pest', condition: (w) => w.temperature >= 22 && w.temperature <= 35 && w.humidity >= 50, severity: 'CRITICAL', message: 'Fall Armyworm risk is high in warm humid conditions. Scout fields weekly and apply Bt-based bioinsecticide at first signs.' },
    { crop: 'maize', pest: 'Maize Streak Virus', type: 'viral', condition: (w) => w.temperature >= 25 && w.humidity >= 60, severity: 'MEDIUM', message: 'Leafhopper activity (Maize Streak Virus vector) may increase. Monitor for yellow streaking on leaves.' },

    // Sugarcane diseases
    { crop: 'sugarcane', pest: 'Red Rot', type: 'fungal', condition: (w) => w.humidity > 80 && w.temperature >= 25 && w.temperature <= 35, severity: 'HIGH', message: 'Humid conditions favor Red Rot in sugarcane. Avoid waterlogging and use disease-free seed cane.' },
    { crop: 'sugarcane', pest: 'Stem Borer', type: 'pest', condition: (w) => w.temperature >= 25 && w.temperature <= 35, severity: 'MEDIUM', message: 'Warm conditions encourage sugarcane Stem Borer activity. Install light traps and release Trichogramma parasitoids.' },

    // Groundnut diseases
    { crop: 'groundnut', pest: 'Tikka Disease (Leaf Spot)', type: 'fungal', condition: (w) => w.humidity > 75 && w.temperature >= 20 && w.temperature <= 30, severity: 'HIGH', message: 'Tikka Disease (Cercospora Leaf Spot) risk elevated. Apply mancozeb or carbendazim spray at first signs of spotting.' },

    // Dry/Hot weather rules
    { crop: 'rice', pest: 'Drought Stress in Rice', type: 'abiotic', condition: (w) => w.humidity < 40 && w.temperature > 30, severity: 'HIGH', message: 'Low humidity and high temperature cause drought stress in rice. Ensure adequate irrigation and consider adding mulch to conserve moisture.' },
    { crop: 'wheat', pest: 'Dry Wind Damage', type: 'abiotic', condition: (w) => w.humidity < 40 && w.temperature > 28, severity: 'MEDIUM', message: 'Dry hot winds can cause grain shriveling in wheat (forced maturity). Light irrigation during hot afternoons can reduce damage.' },
    { crop: 'cotton', pest: 'Jassid (Leafhopper)', type: 'pest', condition: (w) => w.temperature >= 25 && w.humidity < 60, severity: 'MEDIUM', message: 'Warm dry conditions favor Jassid (leafhopper) populations in cotton. Monitor for leaf curling and yellowing. Apply imidacloprid if threshold crossed.' },
    { crop: 'tomato', pest: 'Spider Mites', type: 'pest', condition: (w) => w.temperature > 28 && w.humidity < 50, severity: 'MEDIUM', message: 'Hot dry conditions favor spider mite outbreaks on tomato. Increase irrigation frequency and apply neem oil or insecticidal soap.' },
    { crop: 'maize', pest: 'Stem Borer (Dry Season)', type: 'pest', condition: (w) => w.temperature >= 25 && w.humidity < 60, severity: 'MEDIUM', message: 'Dry season conditions favor maize stem borer. Scout for deadhearts and frass in leaf whorls. Release Trichogramma or apply neem-based spray.' },
    { crop: 'sugarcane', pest: 'Woolly Aphid', type: 'pest', condition: (w) => w.temperature >= 25 && w.temperature <= 35 && w.humidity < 60, severity: 'MEDIUM', message: 'Dry warm conditions favor Woolly Aphid infestation in sugarcane. Scout for white cotton-like masses on leaf undersides.' },
    { crop: 'groundnut', pest: 'Thrips', type: 'pest', condition: (w) => w.temperature > 28 && w.humidity < 50, severity: 'MEDIUM', message: 'Hot dry weather favors thrips in groundnut. Monitor for silvering of leaves and stunted growth. Apply thiamethoxam spray if needed.' },

    // General rules (all crops)
    { crop: '*', pest: 'Waterlogging Stress', type: 'abiotic', condition: (w) => w.forecastRainfall > 50, severity: 'HIGH', message: 'Heavy rainfall predicted! Ensure drainage channels are clear. Waterlogging can cause root rot and nutrient leaching.' },
    { crop: '*', pest: 'Heat Stress', type: 'abiotic', condition: (w) => w.temperature > 40, severity: 'CRITICAL', message: 'Extreme heat alert! Increase irrigation frequency. Mulch around plants and avoid mid-day field operations.' },
    { crop: '*', pest: 'Hot Weather Advisory', type: 'abiotic', condition: (w) => w.temperature > 32 && w.temperature <= 40, severity: 'MEDIUM', message: 'Hot weather detected. Irrigate during early morning or evening. Mulch around plant bases and avoid mid-day fertilizer application.' },
    { crop: '*', pest: 'Dry Spell Alert', type: 'abiotic', condition: (w) => w.humidity < 40 && w.forecastRainfall === 0, severity: 'MEDIUM', message: 'Dry spell conditions detected: low humidity with no rain expected. Ensure adequate irrigation and monitor crops for wilting. Apply mulch to conserve soil moisture.' },
    { crop: '*', pest: 'Frost Risk', type: 'abiotic', condition: (w) => w.temperature < 5, severity: 'CRITICAL', message: 'Frost risk detected! Cover sensitive crops with straw/plastic sheets. Irrigate lightly the evening before to raise soil temperature.' },
    { crop: '*', pest: 'General Fungal Risk', type: 'fungal', condition: (w) => w.humidity > 85 && w.forecastRainfall > 10, severity: 'MEDIUM', message: 'Prolonged wet conditions increase general fungal infection risk. Ensure adequate plant spacing and avoid overhead irrigation.' },
    { crop: '*', pest: 'Mite & Insect Watch', type: 'pest', condition: (w) => w.temperature >= 28 && w.humidity < 45, severity: 'LOW', message: 'Warm dry conditions can increase mite and sucking pest populations. Inspect leaf undersides regularly and use neem-based sprays if pests are spotted.' },
];

/**
 * Generate pest/disease alerts for a given farm and weather
 * @param {Object} farm - Farm object with current_crop, soil_type, etc.
 * @param {Object} weather - Weather object with temperature, humidity, forecastRainfall
 * @returns {Array} Array of alert objects
 */
exports.generateAlerts = (farm, weather) => {
    const crop = (farm.current_crop || '').toLowerCase();
    const alerts = [];

    // If no weather data, generate general crop-based alerts instead of returning empty
    if (!weather) {
        alerts.push({
            pest_disease: 'Weather Data Unavailable',
            alert_type: 'abiotic',
            severity: 'MEDIUM',
            message: `Weather data could not be fetched for this farm. Ensure your farm has a valid location (lat/lon or district/state). General precaution: inspect ${farm.current_crop || 'crops'} regularly for common pests and diseases.`,
            crop: farm.current_crop,
            weather_snapshot: null,
        });

        // Add general crop-specific tips even without weather
        const generalTips = {
            rice: { pest: 'General Rice Advisory', message: 'Monitor for Rice Blast and Brown Plant Hopper. Ensure proper water management and avoid excess nitrogen.' },
            wheat: { pest: 'General Wheat Advisory', message: 'Watch for Wheat Rust and aphid infestations. Ensure proper seed treatment before sowing.' },
            cotton: { pest: 'General Cotton Advisory', message: 'Scout for Bollworm and whitefly regularly. Use pheromone traps for early detection.' },
            tomato: { pest: 'General Tomato Advisory', message: 'Inspect for Early Blight, Late Blight, and whitefly. Remove infected leaves promptly.' },
            potato: { pest: 'General Potato Advisory', message: 'Late Blight is the primary risk. Apply preventive copper-based spray during humid periods.' },
            maize: { pest: 'General Maize Advisory', message: 'Fall Armyworm is a major threat. Scout weekly and use Bt-based bioinsecticide at first sign.' },
            sugarcane: { pest: 'General Sugarcane Advisory', message: 'Watch for Red Rot and Stem Borer. Maintain field hygiene and use disease-free seed cane.' },
            onion: { pest: 'General Onion Advisory', message: 'Purple Blotch and Thrips are common threats. Apply mancozeb spray preventively.' },
            chilli: { pest: 'General Chilli Advisory', message: 'Watch for fruit borer and leaf curl virus. Use neem-based sprays for pest control.' },
            groundnut: { pest: 'General Groundnut Advisory', message: 'Tikka disease (leaf spot) is common. Apply fungicide at first symptoms.' },
        };

        if (generalTips[crop]) {
            alerts.push({
                pest_disease: generalTips[crop].pest,
                alert_type: 'pest',
                severity: 'LOW',
                message: generalTips[crop].message,
                crop: farm.current_crop,
                weather_snapshot: null,
            });
        }

        return alerts;
    }

    PEST_DISEASE_RULES.forEach(rule => {
        // Match specific crop or wildcard
        if (rule.crop !== '*' && rule.crop !== crop) return;

        try {
            if (rule.condition(weather)) {
                alerts.push({
                    pest_disease: rule.pest,
                    alert_type: rule.type,
                    severity: rule.severity,
                    message: rule.message,
                    crop: farm.current_crop,
                    weather_snapshot: {
                        temperature: weather.temperature,
                        humidity: weather.humidity,
                        rainfall: weather.forecastRainfall || 0,
                    },
                });
            }
        } catch (e) {
            // skip broken rule
        }
    });

    // If weather was fetched but no rules matched, add a general status alert
    if (alerts.length === 0) {
        alerts.push({
            pest_disease: 'No Immediate Threat Detected',
            alert_type: 'abiotic',
            severity: 'LOW',
            message: `Current conditions (${weather.temperature}°C, ${weather.humidity}% humidity) do not trigger any specific pest or disease alerts for ${farm.current_crop || 'your crop'}. Continue routine monitoring and maintain good field hygiene.`,
            crop: farm.current_crop,
            weather_snapshot: {
                temperature: weather.temperature,
                humidity: weather.humidity,
                rainfall: weather.forecastRainfall || 0,
            },
        });
    }

    // Sort: CRITICAL > HIGH > MEDIUM > LOW
    const order = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
    alerts.sort((a, b) => (order[a.severity] || 5) - (order[b.severity] || 5));

    return alerts;
};
