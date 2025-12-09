const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireTrainer, requireMember } = require('../middleware/auth');
const {
    markAttendance,
    getSessionAttendance,
    getMemberAttendance
} = require('../controllers/attendanceController');

router.use(authenticateToken);

// Mark attendance (Admin/Trainer)
router.post('/', requireTrainer, markAttendance); // requireTrainer allows Admin too

// Get session attendance (Admin/Trainer)
router.get('/session/:sessionId', requireTrainer, getSessionAttendance);

// Get member attendance (Member)
router.get('/member', requireMember, getMemberAttendance);

module.exports = router;
