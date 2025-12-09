const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    getSessions,
    createSession,
    updateSession,
    cancelSession
} = require('../controllers/sessionController');

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/sessions
router.get('/', getSessions);

// @route   POST /api/sessions
router.post('/', requireAdmin, createSession);

// @route   PUT /api/sessions/:id
router.put('/:id', requireAdmin, updateSession);

// @route   PUT /api/sessions/:id/cancel
router.put('/:id/cancel', requireAdmin, cancelSession);

module.exports = router;
