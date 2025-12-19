const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendanceByDate,
    getEmployeeAttendance
} = require('../controllers/employeeAttendanceController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes are protected and require admin access
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', markAttendance);
router.get('/date/:date', getAttendanceByDate);
router.get('/employee/:id', getEmployeeAttendance);

module.exports = router;
