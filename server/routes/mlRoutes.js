const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const pool = require('../config/db');
const FormData = require('form-data');

// Multer Upload config (Max 5MB)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Please upload an image file'), false);
        }
        cb(null, true);
    }
});

// @route   POST /api/disease/detect
// @desc    Detect plant disease from image via FastAPI service
// @access  Private
router.post('/detect', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided for analysis', fallback: false });
        }

        const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

        // 1. Health check ML service first to ensure fallback stability
        try {
            const healthCheck = await axios.get(`${ML_SERVICE_URL}/health`);
            if (healthCheck.data.status !== 'ok') throw new Error('Unhealthy ML Service');
        } catch (healthErr) {
            console.warn('ML Service is down or unhealthy:', healthErr.message);
            return res.status(503).json({
                error: 'Disease detection service unavailable',
                fallback: true
            });
        }

        // 2. Prepare FormData for FastAPI
        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // 3. Post to ML Service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, formData, {
            headers: formData.getHeaders()
        });

        const result = mlResponse.data;

        // 4. Store in Database
        await pool.query(
            `INSERT INTO disease_reports 
            (user_id, image_url, predicted_disease, confidence, treatment, low_confidence) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                req.user.id,
                'image_uploaded_memory', // Placeholder: Actual apps use S3/cloudinary URLs
                result.disease,
                result.confidence,
                result.treatment,
                result.low_confidence
            ]
        );

        res.json(result);

    } catch (err) {
        // Handle multer errors specifically if needed
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message, fallback: false });
        }

        console.error('Disease detection backend error:', err.message);

        // Final catch-all for ML Service hard failure post-health check
        if (err.code === 'ECONNREFUSED' || err.response?.status >= 500) {
            return res.status(503).json({
                error: 'Disease detection service unavailable',
                fallback: true
            });
        }

        res.status(500).json({ error: 'Server Error processing image', fallback: false });
    }
});

module.exports = router;
