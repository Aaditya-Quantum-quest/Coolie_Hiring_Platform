const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
    confirmCoolieArrival,
    verifyOtpAndStartTrip,
    completeTrip
} = require('../controllers/booking-extended.controller');

// Booking flow routes
router.post('/booking/:id/confirm-arrival', protect, confirmCoolieArrival);
router.post('/booking/:id/verify-otp-and-start', protect, verifyOtpAndStartTrip);
router.post('/booking/:id/complete', protect, completeTrip);

module.exports = router;
