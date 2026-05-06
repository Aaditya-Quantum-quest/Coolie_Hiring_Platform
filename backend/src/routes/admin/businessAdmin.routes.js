const express = require('express');
const router = express.Router();
const { getAll, getOne, approveLevel1, approveLevel2, reject, deactivate, getStats, deleteBusiness } = require('../../controllers/admin/businessAdmin.controller');
const { protectAdmin, requireRegularAdmin, requireSuperAdmin } = require('../../middleware/adminAuth.middleware');

router.get('/stats', protectAdmin, requireRegularAdmin, getStats);
router.get('/', protectAdmin, requireRegularAdmin, getAll);
router.get('/:businessId', protectAdmin, requireRegularAdmin, getOne);

// Level 1 — regular admin
router.patch('/:businessId/approve-level1', protectAdmin, requireRegularAdmin, approveLevel1);

// Level 2 — super admin only
router.patch('/:businessId/approve-level2', protectAdmin, requireSuperAdmin, approveLevel2);

router.patch('/:businessId/reject', protectAdmin, requireRegularAdmin, reject);
router.patch('/:businessId/deactivate', protectAdmin, requireRegularAdmin, deactivate);

// DELETE — super admin only 🚨
router.delete('/:businessId', protectAdmin, requireSuperAdmin, deleteBusiness);

module.exports = router;
