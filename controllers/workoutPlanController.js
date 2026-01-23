const WorkoutPlan = require('../models/WorkoutPlan');
const socketUtils = require('../utils/socket');


// @desc    Create a new workout plan
// @route   POST /api/workout-plans
// @access  Protected (Admin/Trainer)
const createWorkoutPlan = async (req, res) => {
    try {
        const { title, difficulty, traineeId, startDate, endDate, workoutDays } = req.body;

        const workoutPlan = await WorkoutPlan.create({
            title,
            difficulty,
            trainerId: req.user.id,
            traineeId,
            startDate,
            endDate,
            workoutDays
        });

        res.status(201).json({
            success: true,
            data: workoutPlan
        });

        // Emit real-time notification to trainee
        socketUtils.emitToUser(traineeId.toString(), 'new_workout_plan', {
            message: `A new workout plan "${title}" has been created for you!`,
            planId: workoutPlan._id
        });

    } catch (error) {
        console.error('Create workout plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating workout plan'
        });
    }
};

// @desc    Get all workout plans
// @route   GET /api/workout-plans
// @access  Protected
const getWorkoutPlans = async (req, res) => {
    try {
        let query = {};

        // Role-based filtering
        if (req.user.role === 'trainer') {
            query.trainerId = req.user.id;
        } else if (req.user.role === 'member') {
            query.traineeId = req.user.id;
        }

        const workoutPlans = await WorkoutPlan.find(query)
            .populate('trainerId', 'name email')
            .populate('traineeId', 'name email')
            .sort({ createdAt: -1 });
        socketUtils.emitToUser(req.user.id, 'workout_plans', {
            workoutPlans
        })

        res.status(200).json({
            success: true,
            count: workoutPlans.length,
            data: workoutPlans
        });
    } catch (error) {
        console.error('Get workout plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching workout plans'
        });
    }
};

// @desc    Get single workout plan
// @route   GET /api/workout-plans/:id
// @access  Protected
const getWorkoutPlanById = async (req, res) => {
    try {
        const workoutPlan = await WorkoutPlan.findById(req.params.id)
            .populate('trainerId', 'name email')
            .populate('traineeId', 'name email');

        if (!workoutPlan) {
            return res.status(404).json({
                success: false,
                message: 'Workout plan not found'
            });
        }

        // Access control
        if (req.user.role === 'member' && workoutPlan.traineeId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this plan'
            });
        }

        if (req.user.role === 'trainer' && workoutPlan.trainerId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this plan'
            });
        }

        res.status(200).json({
            success: true,
            data: workoutPlan
        });
    } catch (error) {
        console.error('Get workout plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching workout plan'
        });
    }
};

// @desc    Update workout plan
// @route   PUT /api/workout-plans/:id
// @access  Protected (Admin/Trainer)
const updateWorkoutPlan = async (req, res) => {
    try {
        let workoutPlan = await WorkoutPlan.findById(req.params.id);

        if (!workoutPlan) {
            return res.status(404).json({
                success: false,
                message: 'Workout plan not found'
            });
        }

        // Access control
        if (req.user.role !== 'admin' && workoutPlan.trainerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this plan'
            });
        }

        workoutPlan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: workoutPlan
        });

        // Emit real-time notification to trainee
        socketUtils.emitToUser(workoutPlan.traineeId.toString(), 'update_workout_plan', {
            message: `Your workout plan "${workoutPlan.title}" has been updated.`,
            planId: workoutPlan._id
        });

    } catch (error) {
        console.error('Update workout plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating workout plan'
        });
    }
};

// @desc    Delete workout plan
// @route   DELETE /api/workout-plans/:id
// @access  Protected (Admin/Trainer)
const deleteWorkoutPlan = async (req, res) => {
    try {
        const workoutPlan = await WorkoutPlan.findById(req.params.id);

        if (!workoutPlan) {
            return res.status(404).json({
                success: false,
                message: 'Workout plan not found'
            });
        }

        // Access control
        if (req.user.role !== 'admin' && workoutPlan.trainerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this plan'
            });
        }

        await workoutPlan.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Workout plan removed'
        });
    } catch (error) {
        console.error('Delete workout plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting workout plan'
        });
    }
};

module.exports = {
    createWorkoutPlan,
    getWorkoutPlans,
    getWorkoutPlanById,
    updateWorkoutPlan,
    deleteWorkoutPlan
};
