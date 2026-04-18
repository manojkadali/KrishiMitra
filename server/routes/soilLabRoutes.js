const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const soilLabController = require('../controllers/soilLabController');

// GET /api/soil-labs/search?latitude=X&longitude=Y or ?state=X&district=Y
router.get('/search', auth, soilLabController.findNearestLabs);

// GET /api/soil-labs/sample-instructions
router.get('/sample-instructions', auth, soilLabController.getSampleInstructions);

module.exports = router;
