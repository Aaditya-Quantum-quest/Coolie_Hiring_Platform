const express = require('express');
const router = express.Router();
const { getDashboard, getProfile, updateProfile, updateLocation } = require('../../controllers/business/owner.controller');
const { authenticateOwner } = require('../../middleware/authBusiness.middleware');
const { getDishes, addDish, updateDish, deleteDish, toggleDishAvailability } = require('../../controllers/business/dishes.controller');
const { getRooms, addRoom, updateRoom, deleteRoom, toggleRoomAvailability } = require('../../controllers/business/rooms.controller');
const { getHalls, addHall, updateHall, deleteHall } = require('../../controllers/business/halls.controller');
const { getReviews, replyToReview, toggleVisibility } = require('../../controllers/business/reviews.controller');
const upload = require('../../middleware/businessUpload.middleware');

// All routes are protected
router.use(authenticateOwner);

// Dashboard & Profile
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), updateProfile);
router.put('/location', updateLocation);

// Dishes (Restaurant only)
router.get('/dishes', getDishes);
router.post('/dishes', upload.single('photo'), addDish);
router.put('/dishes/:dishId', upload.single('photo'), updateDish);
router.delete('/dishes/:dishId', deleteDish);
router.patch('/dishes/:dishId/availability', toggleDishAvailability);

// Rooms (Hotel only)
router.get('/rooms', getRooms);
router.post('/rooms', upload.fields([{ name: 'photos', maxCount: 5 }]), addRoom);
router.put('/rooms/:roomId', upload.fields([{ name: 'photos', maxCount: 5 }]), updateRoom);
router.delete('/rooms/:roomId', deleteRoom);
router.patch('/rooms/:roomId/availability', toggleRoomAvailability);

// Halls (Hotel only)
router.get('/halls', getHalls);
router.post('/halls', upload.fields([{ name: 'photos', maxCount: 5 }]), addHall);
router.put('/halls/:hallId', upload.fields([{ name: 'photos', maxCount: 5 }]), updateHall);
router.delete('/halls/:hallId', deleteHall);

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews/:reviewId/reply', replyToReview);
router.put('/reviews/:reviewId/reply', replyToReview);
router.patch('/reviews/:reviewId/visibility', toggleVisibility);

// Notifications
router.get('/notifications', async (req, res) => {
    const db = require('../../config/db');
    const result = await db.query('SELECT * FROM business_notifications WHERE owner_id=$1 ORDER BY created_at DESC LIMIT 30', [req.owner.id]);
    res.json({ success: true, notifications: result.rows });
});
router.patch('/notifications/:id/read', async (req, res) => {
    const db = require('../../config/db');
    await db.query('UPDATE business_notifications SET is_read=true WHERE id=$1 AND owner_id=$2', [req.params.id, req.owner.id]);
    res.json({ success: true });
});
router.patch('/notifications/read-all', async (req, res) => {
    const db = require('../../config/db');
    await db.query('UPDATE business_notifications SET is_read=true WHERE owner_id=$1', [req.owner.id]);
    res.json({ success: true });
});

module.exports = router;
