/**
 * Price Forecasting Service
 * Generates trend data and simple moving-average forecasts from market price history.
 */

// Historical price patterns (baseline seasonal data for common crops)
// Used when not enough DB history exists
const SEASONAL_PATTERNS = {
    'wheat':    [2100, 2050, 1980, 1950, 1920, 1950, 2000, 2050, 2100, 2150, 2200, 2250],
    'rice':     [1900, 1850, 1800, 1780, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 1980],
    'cotton':   [6500, 6400, 6300, 6200, 6100, 6200, 6400, 6600, 6800, 7000, 7100, 6800],
    'maize':    [1800, 1750, 1700, 1650, 1600, 1650, 1700, 1800, 1850, 1900, 1950, 1850],
    'potato':   [1200, 1100, 1000, 900, 800, 850, 900, 1000, 1100, 1200, 1300, 1350],
    'tomato':   [2000, 1800, 1500, 1200, 1000, 1200, 1500, 2000, 2500, 3000, 2800, 2300],
    'onion':    [1500, 1400, 1300, 1200, 1100, 1200, 1400, 1600, 1800, 2000, 2200, 1800],
    'sugarcane':[2800, 2750, 2700, 2700, 2750, 2800, 2850, 2900, 2950, 3000, 3000, 2900],
    'soybean':  [3800, 3700, 3600, 3500, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 3900],
    'mustard':  [4500, 4400, 4300, 4200, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4600],
    'groundnut':[4800, 4700, 4600, 4500, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 4900],
    'chickpea': [4200, 4100, 4000, 3900, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4300],
    'lentil':   [4000, 3900, 3800, 3700, 3600, 3700, 3800, 3900, 4000, 4100, 4200, 4100],
    'chilli':   [8000, 7500, 7000, 6500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 8500],
    'millet':   [2200, 2150, 2100, 2050, 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2250],
};

/**
 * Generate trend data + 30-day forecast for a commodity
 * @param {string} commodity
 * @param {string} state
 * @param {Array} dbHistory - Array of {modal_price, recorded_at} from DB
 * @returns {Object} Trend and forecast data
 */
exports.generateForecast = (commodity, state, dbHistory = []) => {
    const normalizedCommodity = (commodity || '').toLowerCase();
    const currentMonth = new Date().getMonth();

    // Build historical trend (last 12 months)
    let trendData = [];

    if (dbHistory.length >= 5) {
        // Use actual DB history
        trendData = dbHistory.map(h => ({
            date: h.recorded_at,
            price: parseFloat(h.modal_price),
        }));
    } else {
        // Use seasonal pattern baseline with slight randomness
        const pattern = SEASONAL_PATTERNS[normalizedCommodity] || SEASONAL_PATTERNS['wheat'];
        for (let i = 11; i >= 0; i--) {
            const monthIdx = (currentMonth - i + 12) % 12;
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const variation = (Math.random() - 0.5) * 100;
            trendData.push({
                date: date.toISOString().split('T')[0],
                price: Math.round(pattern[monthIdx] + variation),
            });
        }
    }

    // Calculate moving averages (7-day and 30-day windows mapped to available data)
    const prices = trendData.map(t => t.price);
    const shortWindow = Math.min(3, prices.length);
    const longWindow = Math.min(7, prices.length);

    const shortMA = prices.slice(-shortWindow).reduce((a, b) => a + b, 0) / shortWindow;
    const longMA = prices.slice(-longWindow).reduce((a, b) => a + b, 0) / longWindow;

    // Trend direction
    let trend = 'stable';
    if (shortMA > longMA * 1.03) trend = 'rising';
    else if (shortMA < longMA * 0.97) trend = 'falling';

    // Simple forecast: extend trend for next 30 days (4 data points, weekly)
    const lastPrice = prices[prices.length - 1] || 2000;
    const priceChange = prices.length > 1 ? (prices[prices.length - 1] - prices[prices.length - 2]) : 0;
    const weeklyChange = priceChange * 0.5; // dampened

    const forecast = [];
    for (let week = 1; week <= 4; week++) {
        const date = new Date();
        date.setDate(date.getDate() + week * 7);
        const forecastPrice = Math.round(lastPrice + weeklyChange * week);
        forecast.push({
            date: date.toISOString().split('T')[0],
            predicted_price: Math.max(forecastPrice, 100), // floor at 100
            confidence: week <= 2 ? 'High' : 'Medium',
        });
    }

    // Sell recommendation
    const forecastAvg = forecast.reduce((a, f) => a + f.predicted_price, 0) / forecast.length;
    let recommendation = 'hold';
    let recommendationText = 'Prices are stable. Monitor for a few more days.';

    if (trend === 'falling' && lastPrice > forecastAvg) {
        recommendation = 'sell_now';
        recommendationText = 'Prices are trending down. Consider selling soon to maximize returns.';
    } else if (trend === 'rising') {
        recommendation = 'hold';
        recommendationText = 'Prices are rising. Consider holding for better returns in the coming weeks.';
    } else if (lastPrice > shortMA) {
        recommendation = 'sell_now';
        recommendationText = 'Current price is above recent average. Good time to sell.';
    }

    return {
        commodity,
        state,
        currentPrice: lastPrice,
        trend,
        shortTermAvg: Math.round(shortMA),
        longTermAvg: Math.round(longMA),
        trendData,
        forecast,
        recommendation,
        recommendationText,
        priceChangePercent: prices.length > 1
            ? Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 * 10) / 10
            : 0,
    };
};
