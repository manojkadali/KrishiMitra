const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pool = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Simulated dummy fallback if the government API fails (Requested gracefully)
const dummyPrices = [
    { commodity: "Wheat", state: "Punjab", district: "Ludhiana", market: "Khanna", min_price: 2125, max_price: 2350, modal_price: 2200 },
    { commodity: "Wheat", state: "Punjab", district: "Patiala", market: "Rajpura", min_price: 2100, max_price: 2310, modal_price: 2150 },
    { commodity: "Rice", state: "Andhra Pradesh", district: "East Godavari", market: "Kakinada", min_price: 1800, max_price: 2400, modal_price: 2050 },
    { commodity: "Cotton", state: "Maharashtra", district: "Akola", market: "Akot", min_price: 6800, max_price: 7200, modal_price: 7000 }
];

// @route   GET /api/market/prices
// @desc    Get real-time market prices from Agmarknet
// @access  Private
router.get('/prices', auth, async (req, res) => {
    try {
        const { state, district, commodity } = req.query;

        if (!state || !district || !commodity) {
            return res.status(400).json({ msg: 'Please provide state, district, and commodity' });
        }

        const API_KEY = '579b464db66ec23bdd0000015b491231010b404e571231d39998e6cb';
        const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

        const fetchAgmarknetData = async (useDistrict = true) => {
            let url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=5`;
            
            url += `&filters[state]=${encodeURIComponent(state)}`;
            url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
            
            if (useDistrict) url += `&filters[district]=${encodeURIComponent(district)}`;

            try {
                const response = await axios.get(url, { timeout: 10000 });
                return { records: response.data?.records || [], isMock: false };
            } catch (err) {
                console.warn(`[WARNING] Agmarknet API Failed (${err.message}). Injecting Mock Data fallback for resilient UI.`);
                
                // Fallback Mock generator identical to the Agmarknet payload structure
                const baseMod = Math.floor(Math.random() * 800) + 1500;
                const mks = useDistrict ? [district + " Main", district + " Secondary"] : [state + " Central Hub", state + " Grain Market", state + " Yard"];
                
                const mockRecords = mks.map((m, i) => ({
                    market: m,
                    commodity: commodity,
                    min_price: baseMod - 150 + (i * 20),
                    max_price: baseMod + 150 + (i * 20),
                    modal_price: baseMod + (i * 20),
                    arrival_date: new Date().toISOString().split('T')[0]
                }));
                
                return { records: mockRecords, isMock: true };
            }
        };

        // 1. Fetch District-level
        let { records, isMock } = await fetchAgmarknetData(true);

        // 2. Fallback State-level if API returns clean 0 (not a crash)
        let fallbackTriggered = false;
        if (records.length === 0) {
            const stateRes = await fetchAgmarknetData(false);
            records = stateRes.records;
            isMock = stateRes.isMock;
            fallbackTriggered = true;
        }

        if (records.length === 0) {
            return res.json({ data: [], bestMarket: null, otherMarkets: [], fallbackTriggered, isMock });
        }

        // 3. Process, Clean, Extract best price
        let bestRecord = null;
        let bestModalPrice = -1;

        const processedData = records.map(r => {
            const min = parseFloat(r.min_price) || 0;
            const max = parseFloat(r.max_price) || 0;
            const modal = parseFloat(r.modal_price) || 0;

            const threshold = (min + max) / 2;
            let advisory = modal > 0 && modal >= threshold ? "Good time to sell" : "Prices are low, consider holding";
            let advisoryType = modal > 0 && modal >= threshold ? "sell" : "hold";

            const cleanedRecord = {
                market: r.market,
                commodity: r.commodity,
                modal_price: modal,
                min_price: min,
                max_price: max,
                arrival_date: r.arrival_date,
                advisory,
                advisoryType
            };

            // Track absolute best modal price globally in response array
            if (modal > bestModalPrice) {
                bestModalPrice = modal;
                bestRecord = cleanedRecord;
            }

            return cleanedRecord;
        });

        const otherMarkets = processedData.filter(r => r !== bestRecord);

        res.json({
            bestMarket: bestRecord,
            otherMarkets: otherMarkets,
            fallbackTriggered,
            isMock
        });

    } catch (err) {
        console.error('Agmarknet API Route Error:', err.message);
        res.status(500).json({ error: 'Server Error retrieving real-time market prices' });
    }
});

module.exports = router;
