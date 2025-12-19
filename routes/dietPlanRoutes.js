const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireTrainer } = require('../middleware/auth');
const {
    createDietPlan,
    getDietPlans,
    getDietPlanById,
    updateDietPlan,
    deleteDietPlan
} = require('../controllers/dietPlanController');

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

// GET /api/diet-plans
router.get('/', getDietPlans);

// GET /api/diet-plans/:id
router.get('/:id', getDietPlanById);

// POST /api/diet-plans
router.post('/', requireAdminOrTrainer, createDietPlan);

// PUT /api/diet-plans/:id
router.put('/:id', requireAdminOrTrainer, updateDietPlan);

// DELETE /api/diet-plans/:id
router.delete('/:id', requireAdminOrTrainer, deleteDietPlan);

module.exports = router;
