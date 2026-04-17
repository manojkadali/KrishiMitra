const soilLabLocator = require('../services/soilLabLocator');

exports.findNearestLabs = (req, res) => {
    try {
        const { latitude, longitude, state, district, limit } = req.query;

        const lat = latitude ? parseFloat(latitude) : null;
        const lon = longitude ? parseFloat(longitude) : null;
        const maxResults = Math.min(parseInt(limit) || 10, 50);

        if (lat && (lat < -90 || lat > 90)) {
            return res.status(400).json({ error: 'Invalid latitude' });
        }
        if (lon && (lon < -180 || lon > 180)) {
            return res.status(400).json({ error: 'Invalid longitude' });
        }

        const labs = soilLabLocator.findNearestLabs(lat, lon, state, district, maxResults);

        res.json({
            count: labs.length,
            searchedBy: lat ? 'coordinates' : state ? 'state/district' : 'default',
            labs,
        });
    } catch (error) {
        console.error('Soil lab locator error:', error.message);
        res.status(500).json({ error: 'Failed to find soil testing labs' });
    }
};

exports.getSampleInstructions = (req, res) => {
    try {
        const instructions = soilLabLocator.getSampleInstructions();
        res.json(instructions);
    } catch (error) {
        console.error('Sample instructions error:', error.message);
        res.status(500).json({ error: 'Failed to get instructions' });
    }
};
