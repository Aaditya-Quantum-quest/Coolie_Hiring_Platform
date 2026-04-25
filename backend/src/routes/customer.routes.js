const express = require('express');
const router = express.Router();
const { getStations, getAllCoolies, getCoolieProfile } = require('../controllers/customer.controller');

router.get('/stations', getStations);
router.get('/coolies', getAllCoolies);
router.get('/coolies/:id', getCoolieProfile);

module.exports = router;
