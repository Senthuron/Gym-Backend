const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireTrainer } = require('../middleware/auth');
const {
    createWorkoutPlan,
    getWorkoutPlans,
    getWorkoutPlanById,
    updateWorkoutPlan,
    deleteWorkoutPlan
} = require('../controllers/workoutPlanController');

// All routes require authentication
router.use(authenticateToken);

// Helper middleware for Admin or Trainer
const requireAdminOrTrainer = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'trainer') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Trainer role required.'
    });
};

// GET /api/workout-plans
router.get('/', getWorkoutPlans);

// GET /api/workout-plans/:id
router.get('/:id', getWorkoutPlanById);

// POST /api/workout-plans
router.post('/', requireAdminOrTrainer, createWorkoutPlan);

// PUT /api/workout-plans/:id
router.put('/:id', requireAdminOrTrainer, updateWorkoutPlan);

// DELETE /api/workout-plans/:id
router.delete('/:id', requireAdminOrTrainer, deleteWorkoutPlan);

module.exports = router;
