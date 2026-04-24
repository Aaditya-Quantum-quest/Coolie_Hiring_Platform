const express = require('express');
const router = express.Router();
const { register, login, changePassword, getStations } = require('../../controllers/business/auth.controller');
const { authenticateOwner } = require('../../middleware/authBusiness.middleware');
const upload = require('../../middleware/businessUpload.middleware');

router.get('/stations', getStations);
router.post('/register', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]), register);
router.post('/login', login);
router.post('/change-password', authenticateOwner, changePassword);

module.exports = router;
