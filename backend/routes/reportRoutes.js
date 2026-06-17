const express = require('express');
const router = express.Router();
const { getCertificateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/certificate', protect, getCertificateReport);

module.exports = router;
