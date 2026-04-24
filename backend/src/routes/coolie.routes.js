const express = require('express');
const router = express.Router();
const { goOnline, goOffline, getStatus } = require('../controllers/coolie.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/go-online', protect, goOnline);
router.post('/go-offline', protect, goOffline);
router.get('/status', protect, getStatus);

module.exports = router;
