const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, rateBooking, payBooking, getBookingDetails, updateBookingStatus } = require('../controllers/booking.controller');
const { confirmCoolieArrival, verifyOtpAndStartTrip, completeTrip } = require('../controllers/booking-extended.controller');

const { protect } = require('../middleware/auth.middleware');
const { luggagePhotoUpload } = require('../config/multer');

router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingDetails);
router.post('/:id/rate', rateBooking);
router.post('/:id/pay', payBooking);
router.post('/:id/status', updateBookingStatus);

// Extended booking flow routes
router.post('/:id/confirm-arrival', confirmCoolieArrival);
router.post('/:id/verify-otp-and-start', verifyOtpAndStartTrip);
router.post('/:id/complete', completeTrip);

router.post('/upload-luggage', luggagePhotoUpload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({ 
        success: true, 
        url: `/uploads/luggage_photos/${req.file.filename}` 
    });
});

module.exports = router;
