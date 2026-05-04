const express = require('express');
const router = express.Router();
const { 
    goOnline, goOffline, getStatus, getProfile,
    getDashboardStats, getActiveJobs, getCompletedToday, getUpcomingRequests,
    getDashboardOverview, getPublicProfile, updateProfile
} = require('../controllers/coolie.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/go-online', protect, goOnline);
router.post('/go-offline', protect, goOffline);
router.get('/status/:coolieId', protect, getStatus);
router.get('/profile', protect, getProfile);
router.put('/profile/:coolieId', protect, updateProfile);
router.get('/verify/:coolieId', getPublicProfile);

// Dashboard routes
router.get('/dashboard-overview/:coolieId', protect, getDashboardOverview);
router.get('/dashboard/:coolieId/stats', protect, getDashboardStats);
router.get('/active-jobs/:coolieId', protect, getActiveJobs);
router.get('/completed-today/:coolieId', protect, getCompletedToday);
router.get('/requests/:coolieId', protect, getUpcomingRequests);

module.exports = router;
