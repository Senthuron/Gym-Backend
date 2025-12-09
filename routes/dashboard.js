const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireTrainer, requireMember } = require('../middleware/auth');
const {
    getAdminStats,
    getTrainerStats,
    getMemberStats
} = require('../controllers/dashboardController');

router.use(authenticateToken);

router.get('/admin', requireAdmin, getAdminStats);
router.get('/trainer', requireTrainer, getTrainerStats);
router.get('/member', requireMember, getMemberStats);

module.exports = router;
