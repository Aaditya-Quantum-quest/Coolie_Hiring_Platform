const express = require('express');
const router = express.Router();
const { getBusinessesByStation, getBusinessDetail, postReview, getStations, getAllBusinesses } = require('../../controllers/business/public.controller');

router.get('/stations', getStations);
router.get('/businesses', getAllBusinesses);
router.get('/stations/:stationId/businesses', getBusinessesByStation);
router.get('/businesses/:businessId', getBusinessDetail);
router.post('/businesses/:businessId/reviews', postReview);

module.exports = router;
