const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ── Realistic commodity base prices (₹ per quintal) for Indian markets ──
const COMMODITY_PRICES = {
    'Rice':       { base: 2200, spread: 400 },
    'Wheat':      { base: 2300, spread: 350 },
    'Maize':      { base: 1900, spread: 300 },
    'Cotton':     { base: 6800, spread: 600 },
    'Soybean':    { base: 4500, spread: 500 },
    'Groundnut':  { base: 5200, spread: 600 },
    'Sugarcane':  { base: 350,  spread: 50  },
    'Onion':      { base: 1800, spread: 700 },
    'Potato':     { base: 1200, spread: 400 },
    'Tomato':     { base: 2000, spread: 900 },
    'Jowar':      { base: 2800, spread: 400 },
    'Bajra':      { base: 2400, spread: 350 },
    'Ragi':       { base: 3200, spread: 400 },
    'Tur':        { base: 7500, spread: 800 },
    'Moong':      { base: 7200, spread: 700 },
    'Urad':       { base: 6800, spread: 600 },
    'Chana':      { base: 5100, spread: 500 },
    'Mustard':    { base: 5000, spread: 600 },
    'Sunflower':  { base: 5500, spread: 500 },
    'Coconut':    { base: 2800, spread: 400 },
    'Arecanut':   { base: 42000, spread: 3000 },
    'Pepper':     { base: 38000, spread: 5000 },
    'Turmeric':   { base: 8500, spread: 1200 },
    'Chilli':     { base: 12000, spread: 2000 },
    'Banana':     { base: 1500, spread: 400 },
    'Mango':      { base: 3500, spread: 1000 },
    'Grapes':     { base: 4000, spread: 800 },
};

// ── Known mandi names by state for realistic mock data ──
const STATE_MANDIS = {
    'Karnataka':         ['Yeshwanthpur', 'Ramanagara', 'Tiptur', 'Hubli (Amaragol)', 'Davangere'],
    'Andhra Pradesh':    ['Kurnool', 'Guntur', 'Kakinada', 'Vijayawada', 'Ongole'],
    'Telangana':         ['Hyderabad (Bowenpally)', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    'Maharashtra':       ['Mumbai (Vashi)', 'Pune (Market Yard)', 'Nashik', 'Nagpur', 'Solapur'],
    'Tamil Nadu':        ['Koyambedu', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
    'Kerala':            ['Ernakulam', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Palakkad'],
    'Punjab':            ['Khanna', 'Rajpura', 'Amritsar', 'Ludhiana', 'Jalandhar'],
    'Haryana':           ['Karnal', 'Hisar', 'Rohtak', 'Sirsa', 'Sonipat'],
    'Uttar Pradesh':     ['Lucknow', 'Agra', 'Varanasi', 'Kanpur', 'Bareilly'],
    'Madhya Pradesh':    ['Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Gwalior'],
    'Rajasthan':         ['Jaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Udaipur'],
    'Gujarat':           ['Ahmedabad', 'Rajkot', 'Surat', 'Junagadh', 'Gondal'],
    'West Bengal':       ['Kolkata (Posta)', 'Burdwan', 'Siliguri', 'Malda', 'Midnapore'],
    'Bihar':             ['Patna', 'Muzaffarpur', 'Bhagalpur', 'Gaya', 'Darbhanga'],
    'Odisha':            ['Bhubaneswar', 'Cuttack', 'Sambalpur', 'Berhampur', 'Rourkela'],
    'Jharkhand':         ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Dumka'],
    'Chhattisgarh':      ['Raipur', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Korba'],
    'Assam':             ['Guwahati', 'Silchar', 'Dibrugarh', 'Nagaon', 'Tezpur'],
};

/**
 * Generate realistic mock market data for a commodity in a state/district.
 * Uses seeded randomness based on inputs so same query → same-ish results.
 */
function generateMockData(commodity, state, district) {
    const normalizedCommodity = Object.keys(COMMODITY_PRICES).find(
        k => k.toLowerCase() === commodity.toLowerCase()
    );
    const priceInfo = normalizedCommodity
        ? COMMODITY_PRICES[normalizedCommodity]
        : { base: 2500, spread: 500 };

    // Seed from input strings for consistent-ish results per query
    const seed = (commodity + state + district).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pseudoRand = (i) => {
        const x = Math.sin(seed + i * 127) * 10000;
        return x - Math.floor(x); // 0-1
    };

    const mandis = STATE_MANDIS[state] || [`${district} Main`, `${district} Yard`, `${state} Central`];
    const today = new Date().toISOString().split('T')[0];

    return mandis.slice(0, 3 + Math.floor(pseudoRand(99) * 2)).map((market, i) => {
        const variation = (pseudoRand(i) - 0.5) * priceInfo.spread;
        const modal = Math.round(priceInfo.base + variation);
        const min = Math.round(modal - priceInfo.spread * 0.25 - pseudoRand(i + 10) * 100);
        const max = Math.round(modal + priceInfo.spread * 0.25 + pseudoRand(i + 20) * 100);

        return {
            market,
            commodity: normalizedCommodity || commodity,
            min_price: min,
            max_price: max,
            modal_price: modal,
            arrival_date: today,
        };
    });
}

// @route   GET /api/market/prices
// @desc    Get real-time market prices from Agmarknet (with robust fallback)
// @access  Private
router.get('/prices', auth, async (req, res) => {
    try {
        const { state, district, commodity } = req.query;

        if (!state || !district || !commodity) {
            return res.status(400).json({ msg: 'Please provide state, district, and commodity' });
        }

        const API_KEY = process.env.AGMARKNET_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

        let records = [];
        let isMock = false;
        let fallbackTriggered = false;

        // Try the government API first
        try {
            // District-level query
            let url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=10`;
            url += `&filters[state]=${encodeURIComponent(state)}`;
            url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
            url += `&filters[district]=${encodeURIComponent(district)}`;

            const response = await axios.get(url, { timeout: 8000 });

            if (response.data?.status === 'ok' && response.data?.records?.length > 0) {
                records = response.data.records;
            } else {
                // State-level fallback
                let stateUrl = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=10`;
                stateUrl += `&filters[state]=${encodeURIComponent(state)}`;
                stateUrl += `&filters[commodity]=${encodeURIComponent(commodity)}`;

                const stateRes = await axios.get(stateUrl, { timeout: 8000 });
                if (stateRes.data?.status === 'ok' && stateRes.data?.records?.length > 0) {
                    records = stateRes.data.records;
                    fallbackTriggered = true;
                }
            }
        } catch (err) {
            console.warn(`[Agmarknet] API call failed: ${err.message}`);
        }

        // If API returned nothing (down, empty, or errored), use mock data
        if (records.length === 0) {
            console.log(`[Market] Using simulated data for: ${commodity} in ${district}, ${state}`);
            records = generateMockData(commodity, state, district);
            isMock = true;
            fallbackTriggered = true;
        }

        // Process and rank results
        let bestRecord = null;
        let bestModalPrice = -1;

        const processedData = records.map(r => {
            const min = parseFloat(r.min_price) || 0;
            const max = parseFloat(r.max_price) || 0;
            const modal = parseFloat(r.modal_price) || 0;

            const threshold = (min + max) / 2;
            const advisory = modal > 0 && modal >= threshold ? "Good time to sell" : "Prices are low, consider holding";
            const advisoryType = modal > 0 && modal >= threshold ? "sell" : "hold";

            const cleanedRecord = {
                market: r.market,
                commodity: r.commodity || commodity,
                modal_price: modal,
                min_price: min,
                max_price: max,
                arrival_date: r.arrival_date || new Date().toISOString().split('T')[0],
                advisory,
                advisoryType
            };

            if (modal > bestModalPrice) {
                bestModalPrice = modal;
                bestRecord = cleanedRecord;
            }

            return cleanedRecord;
        });

        const otherMarkets = processedData.filter(r => r !== bestRecord);

        res.json({
            bestMarket: bestRecord,
            otherMarkets,
            fallbackTriggered,
            isMock
        });

    } catch (err) {
        console.error('Market Route Error:', err.message);
        res.status(500).json({ error: 'Server Error retrieving market prices' });
    }
});

// @route   GET /api/market/forecast
// @desc    Get price trend + forecast for a commodity
// @access  Private
const { getPriceForecast, recordPrice } = require('../controllers/marketForecastController');
router.get('/forecast', auth, getPriceForecast);

// @route   POST /api/market/record-price
// @desc    Record a market price for trend building
// @access  Private
router.post('/record-price', auth, recordPrice);

module.exports = router;
