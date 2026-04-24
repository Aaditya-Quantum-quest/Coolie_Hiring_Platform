const express = require('express');
const router = express.Router();
const { getAll, getOne, approve, reject, deactivate } = require('../../controllers/admin/businessAdmin.controller');
// const { protect, adminOnly } = require('../../middleware/auth.middleware'); // Add admin auth if needed

router.get('/', getAll);
router.get('/:businessId', getOne);
router.patch('/:businessId/approve', approve);
router.patch('/:businessId/reject', reject);
router.patch('/:businessId/deactivate', deactivate);

module.exports = router;
