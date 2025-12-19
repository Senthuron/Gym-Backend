const Feedback = require('../models/Feedback');
const Trainer = require('../models/Trainer');
const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Member
const createFeedback = async (req, res) => {
    try {
        const { trainerId, classId, type, rating, comment, suggestion } = req.body;
        const traineeId = req.user.id;

        // Validation: Either trainerId or classId is required
        if (!trainerId && !classId) {
            return res.status(400).json({
                success: false,
                message: 'Either trainerId or classId is required'
            });
        }

        // Prevent duplicate feedback for the same class/trainer by the same trainee
        const query = { traineeId, type };
        if (type === 'TRAINER') query.trainerId = trainerId;
        if (type === 'CLASS') query.classId = classId;

        const existingFeedback = await Feedback.findOne(query);
        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                message: `You have already provided feedback for this ${type.toLowerCase()}`
            });
        }

        const feedback = await Feedback.create({
            traineeId,
            trainerId,
            classId,
            type,
            rating,
            comment,
            suggestion
        });

        res.status(201).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating feedback'
        });
    }
};

// @desc    Get all feedbacks (Admin) or filtered feedbacks
// @route   GET /api/feedback
// @access  Admin, Trainer, Member
const getFeedbacks = async (req, res) => {
    try {
        const { type, trainerId, classId, status } = req.query;
        let query = {};

        // Role-based access control
        if (req.user.role === 'member') {
            query.traineeId = req.user.id;
        } else if (req.user.role === 'trainer') {
            query.trainerId = req.user.id;
            query.status = 'ACTIVE'; // Trainers only see active feedback
        } else if (req.user.role === 'admin') {
            if (status) query.status = status;
            if (trainerId) query.trainerId = trainerId;
            if (req.query.traineeId) query.traineeId = req.query.traineeId;
            if (classId) query.classId = classId;
            if (type) query.type = type;
        }

        const feedbacks = await Feedback.find(query)
            .populate('traineeId', 'name')
            .populate('trainerId', 'name')
            .populate('classId', 'name date')
            .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } catch (error) {
        console.error('Get feedbacks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feedbacks'
        });
    }
};

// @desc    Get feedback analytics (Admin)
// @route   GET /api/feedback/analytics
// @access  Admin
const getFeedbackAnalytics = async (req, res) => {
    try {
        // Average rating per trainer
        const trainerStats = await Feedback.aggregate([
            { $match: { type: 'TRAINER', status: 'ACTIVE' } },
            {
                $group: {
                    _id: '$trainerId',
                    averageRating: { $avg: '$rating' },
                    totalFeedback: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'trainers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'trainer'
                }
            },
            { $unwind: '$trainer' },
            {
                $project: {
                    name: '$trainer.name',
                    averageRating: { $round: ['$averageRating', 1] },
                    totalFeedback: 1
                }
            }
        ]);

        // Average rating per class
        const classStats = await Feedback.aggregate([
            { $match: { type: 'CLASS', status: 'ACTIVE' } },
            {
                $group: {
                    _id: '$classId',
                    averageRating: { $avg: '$rating' },
                    totalFeedback: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'sessions',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            { $unwind: '$class' },
            {
                $project: {
                    name: '$class.name',
                    averageRating: { $round: ['$averageRating', 1] },
                    totalFeedback: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                trainerStats,
                classStats
            }
        });
    } catch (error) {
        console.error('Get feedback analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
};

// @desc    Update feedback status (Admin)
// @route   PUT /api/feedback/:id/status
// @access  Admin
const updateFeedbackStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['ACTIVE', 'HIDDEN'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('Update feedback status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating feedback status'
        });
    }
};

module.exports = {
    createFeedback,
    getFeedbacks,
    getFeedbackAnalytics,
    updateFeedbackStatus
};
