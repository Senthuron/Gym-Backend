const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireTrainer } = require('../middleware/auth');
const {
    getTrainers,
    getTrainer,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    getTrainerProfile,
    getTrainerClasses
} = require('../controllers/trainerController');

// Public routes (or protected?)
// Let's make getTrainers public so visitors can see trainers? Or protected?
// User request: "Trainer List Page" under Admin. "My Classes" under Trainer.
// Let's require auth for all for now.

router.use(authenticateToken);

// Trainer Profile (Self)
router.get('/profile', requireTrainer, getTrainerProfile);
router.get('/classes', requireTrainer, getTrainerClasses);

// Admin Routes
router.get('/', requireAdmin, getTrainers);
router.post('/', requireAdmin, createTrainer);
router.get('/:id', requireAdmin, getTrainer); // Admin viewing specific trainer
router.put('/:id', requireAdmin, updateTrainer);
router.delete('/:id', requireAdmin, deleteTrainer);

module.exports = router;
