const fs = require('fs');
const path = require('path');

// Load Rules
const rulesPath = path.join(__dirname, '../data/advisoryRules.json');
let rules = [];
try {
    rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
} catch (error) {
    console.error("Failed to load advisory rules:", error.message);
}

/**
 * Calculates growth stage if auto-derived
 */
const calculateStage = (sowingDate) => {
    if (!sowingDate) return "unknown";
    const days = Math.floor((new Date() - new Date(sowingDate)) / (1000 * 60 * 60 * 24));
    if (days < 30) return "sowing";
    if (days < 60) return "tillering";
    if (days < 90) return "flowering";
    return "mature";
};

/**
 * Evaluates rules payload given Farm object and Weather object
 */
exports.generateAdvisories = (farm, weather, manualStage = null) => {
    const stage = manualStage || calculateStage(farm.sowing_date);

    // Summary structure
    const summary = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    };

    const advisories_given = [];
    const rules_triggered = [];
    const warnings = [];

    // Graceful degradation checks
    if (farm.soil_ph === null || farm.soil_ph === undefined) {
        warnings.push("Soil pH not provided. Soil acidity rules skipped.");
    }
    if (!weather) {
        warnings.push("Weather data unavailable. Weather-based rules skipped.");
    }

    rules.forEach((rule) => {
        try {
            // Stage check
            const appliesToStage = rule.applies_to_stages.includes("all") || rule.applies_to_stages.includes(stage.toLowerCase());
            if (!appliesToStage) return;

            // Safe sandbox-like evaluation using Function
            const evaluator = new Function('farm', 'weather', `return ${rule.condition};`);
            const isTriggered = evaluator(farm, weather);

            if (isTriggered) {
                // Update summary counts
                const sevLevel = rule.severity.toLowerCase();
                if (summary[sevLevel] !== undefined) {
                    summary[sevLevel]++;
                }

                advisories_given.push(rule);
                rules_triggered.push(rule.id);
            }
        } catch (err) {
            console.error(`Error evaluating rule ${rule.id}:`, err.message);
            // Engine must NEVER crash, ignore bad rule and continue
        }
    });

    // Sort advisories: CRITICAL > HIGH > MEDIUM > LOW
    const order = { "CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4 };
    advisories_given.sort((a, b) => order[a.severity] - order[b.severity]);

    return {
        summary,
        warnings,
        advisories: advisories_given,
        rules_triggered,
        growthStageUsed: stage
    };
};
