const express = require('express');
const router = express.Router();
const { updateLocation, getNearbyCoolies, getCoolieLocation } = require('../controllers/location.controller');

// Optionally protect routes with JWT middleware
// const { protect } = require('../middleware/auth.middleware');

router.post('/update', updateLocation);
router.get('/nearby', getNearbyCoolies);
router.get('/coolie/:id', getCoolieLocation);

module.exports = router;
