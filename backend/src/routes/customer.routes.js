const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { customerPhotoUpload } = require('../config/multer');
const { 
    getStations, 
    getAllCoolies, 
    getCoolieProfile, 
    getProfile, 
    updateProfile,
    updateCurrentStation
} = require('../controllers/customer.controller');

// Public
router.get('/stations', getStations);
router.get('/coolies/:id', getCoolieProfile);

// Protected (requires customer login)
router.get('/coolies', protect, getAllCoolies);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, customerPhotoUpload, updateProfile);
router.patch('/update-station', protect, updateCurrentStation);

module.exports = router;
