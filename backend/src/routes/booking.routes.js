const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/booking.controller');

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);

module.exports = router;
