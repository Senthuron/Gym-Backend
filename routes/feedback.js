const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireMember } = require('../middleware/auth');
const {
    createFeedback,
    getFeedbacks,
    getFeedbackAnalytics,
    updateFeedbackStatus
} = require('../controllers/feedbackController');

router.use(authenticateToken);

// Create feedback (Member)
router.post('/', requireMember, createFeedback);

// Get feedbacks (Admin, Trainer, Member)
router.get('/', getFeedbacks);

// Get feedback analytics (Admin)
router.get('/analytics', requireAdmin, getFeedbackAnalytics);

// Update feedback status (Admin)
router.put('/:id/status', requireAdmin, updateFeedbackStatus);

module.exports = router;
