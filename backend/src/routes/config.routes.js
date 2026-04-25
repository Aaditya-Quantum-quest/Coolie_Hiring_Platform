const express = require('express');
const router = express.Router();
const { getTrains, getPricing, getBusyHours } = require('../controllers/config.controller');

router.get('/trains', getTrains);
router.get('/pricing', getPricing);
router.get('/busy-hours', getBusyHours);

module.exports = router;
