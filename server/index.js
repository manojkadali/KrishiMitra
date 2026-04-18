require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const pool = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Health route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farms', require('./routes/farmRoutes'));
app.use('/api/advisories', require('./routes/advisoryRoutes'));
app.use('/api/disease', require('./routes/mlRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/crop-recommend', require('./routes/cropRecommendRoutes'));
app.use('/api/irrigation', require('./routes/irrigationRoutes'));
app.use('/api/pest-alerts', require('./routes/pestAlertRoutes'));
app.use('/api/yield', require('./routes/yieldRoutes'));
app.use('/api/soil-labs', require('./routes/soilLabRoutes'));


const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // 👇 Test DB connection when server starts
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('DB connected at:', result.rows[0].now);
    } catch (err) {
        console.error('DB connection error:', err.message);
    }
});
