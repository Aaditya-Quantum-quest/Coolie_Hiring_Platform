const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, rateBooking, payBooking } = require('../controllers/booking.controller');

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.post('/:id/rate', rateBooking);
router.post('/:id/pay', payBooking);

module.exports = router;
