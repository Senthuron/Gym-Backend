const DietPlan = require('../models/DietPlan');

// @desc    Create a new diet plan
// @route   POST /api/diet-plans
// @access  Protected (Admin/Trainer)
const createDietPlan = async (req, res) => {
    try {
        const { title, type, traineeId, startDate, endDate, notes, meals } = req.body;

        const dietPlan = await DietPlan.create({
            title,
            type,
            trainerId: req.user.id,
            traineeId,
            startDate,
            endDate,
            notes,
            meals
        });

        res.status(201).json({
            success: true,
            data: dietPlan
        });
    } catch (error) {
        console.error('Create diet plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating diet plan'
        });
    }
};

// @desc    Get all diet plans
// @route   GET /api/diet-plans
// @access  Protected
const getDietPlans = async (req, res) => {
    try {
        let query = {};

        // Role-based filtering
        if (req.user.role === 'trainer') {
            query.trainerId = req.user.id;
        } else if (req.user.role === 'member') {
            query.traineeId = req.user.id;
        }

        const dietPlans = await DietPlan.find(query)
            .populate('trainerId', 'name email')
            .populate('traineeId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: dietPlans.length,
            data: dietPlans
        });
    } catch (error) {
        console.error('Get diet plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching diet plans'
        });
    }
};

// @desc    Get single diet plan
// @route   GET /api/diet-plans/:id
// @access  Protected
const getDietPlanById = async (req, res) => {
    try {
        const dietPlan = await DietPlan.findById(req.params.id)
            .populate('trainerId', 'name email')
            .populate('traineeId', 'name email');

        if (!dietPlan) {
            return res.status(404).json({
                success: false,
                message: 'Diet plan not found'
            });
        }

        // Access control
        if (req.user.role === 'member' && dietPlan.traineeId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this plan'
            });
        }

        if (req.user.role === 'trainer' && dietPlan.trainerId._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this plan'
            });
        }

        res.status(200).json({
            success: true,
            data: dietPlan
        });
    } catch (error) {
        console.error('Get diet plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching diet plan'
        });
    }
};

// @desc    Update diet plan
// @route   PUT /api/diet-plans/:id
// @access  Protected (Admin/Trainer)
const updateDietPlan = async (req, res) => {
    try {
        let dietPlan = await DietPlan.findById(req.params.id);

        if (!dietPlan) {
            return res.status(404).json({
                success: false,
                message: 'Diet plan not found'
            });
        }

        // Access control: Only owner or admin can update
        if (req.user.role !== 'admin' && dietPlan.trainerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this plan'
            });
        }

        dietPlan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: dietPlan
        });
    } catch (error) {
        console.error('Update diet plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating diet plan'
        });
    }
};

// @desc    Delete diet plan
// @route   DELETE /api/diet-plans/:id
// @access  Protected (Admin/Trainer)
const deleteDietPlan = async (req, res) => {
    try {
        const dietPlan = await DietPlan.findById(req.params.id);

        if (!dietPlan) {
            return res.status(404).json({
                success: false,
                message: 'Diet plan not found'
            });
        }

        // Access control
        if (req.user.role !== 'admin' && dietPlan.trainerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this plan'
            });
        }

        await dietPlan.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Diet plan removed'
        });
    } catch (error) {
        console.error('Delete diet plan error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting diet plan'
        });
    }
};

module.exports = {
    createDietPlan,
    getDietPlans,
    getDietPlanById,
    updateDietPlan,
    deleteDietPlan
};
