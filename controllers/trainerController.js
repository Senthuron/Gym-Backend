const Trainer = require('../models/Trainer');
const User = require('../models/User');
const Session = require('../models/Session');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Public (or Protected?)
const getTrainers = async (req, res) => {
    try {
        // Find all users with role 'trainer'
        const trainerUsers = await User.find({ role: 'trainer' });

        // For each trainer user, ensure they have a Trainer profile
        for (const user of trainerUsers) {
            const existingProfile = await Trainer.findOne({ user: user._id });
            if (!existingProfile) {
                console.log(`Creating missing Trainer profile for user: ${user.name} (${user.email})`);
                await Trainer.create({
                    user: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || 'N/A'
                });
            }
        }

        const trainers = await Trainer.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: trainers.length,
            data: trainers
        });
    } catch (error) {
        console.error('Get trainers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trainers'
        });
    }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Public
const getTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id);

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: trainer
        });
    } catch (error) {
        console.error('Get trainer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trainer'
        });
    }
};

// @desc    Create new trainer
// @route   POST /api/trainers
// @access  Admin
const createTrainer = async (req, res) => {
    try {
        const { name, email, phone, gender, specialization, bio, experience } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and phone'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create User account
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: 'password123', // Default password
            role: 'trainer',
            gender
        });

        // Create Trainer profile
        const trainer = await Trainer.create({
            user: user._id,
            name,
            email: email.toLowerCase(),
            phone,
            specialization,
            bio,
            experience
        });

        res.status(201).json({
            success: true,
            message: 'Trainer created successfully. Default password is "password123"',
            data: trainer
        });
    } catch (error) {
        console.error('Create trainer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating trainer'
        });
    }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Admin
const updateTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id);

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer not found'
            });
        }

        const { name, email, phone, gender, specialization, bio, experience } = req.body;

        // Update fields
        if (name) trainer.name = name;
        if (email) trainer.email = email.toLowerCase();
        if (phone) trainer.phone = phone;
        if (specialization) trainer.specialization = specialization;
        if (bio) trainer.bio = bio;
        if (experience) trainer.experience = experience;

        await trainer.save();

        // Update linked User account
        if (trainer.user) {
            const userUpdate = {};
            if (name) userUpdate.name = name;
            if (email) userUpdate.email = email.toLowerCase();
            if (gender) userUpdate.gender = gender; // Add gender update for User

            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(trainer.user, userUpdate);
            }
        }

        // Also update User email/name if changed?
        // For now, let's assume we might need to sync them, but maybe later.

        res.status(200).json({
            success: true,
            message: 'Trainer updated successfully',
            data: trainer
        });
    } catch (error) {
        console.error('Update trainer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating trainer'
        });
    }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Admin
const deleteTrainer = async (req, res) => {
    try {
        const trainer = await Trainer.findById(req.params.id);

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer not found'
            });
        }

        // Delete associated User
        await User.findByIdAndDelete(trainer.user);

        // Delete Trainer
        await Trainer.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Trainer deleted successfully'
        });
    } catch (error) {
        console.error('Delete trainer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting trainer'
        });
    }
};

// @desc    Get current trainer profile
// @route   GET /api/trainers/profile
// @access  Trainer
const getTrainerProfile = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ user: req.user.id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: trainer
        });
    } catch (error) {
        console.error('Get trainer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

// @desc    Get classes assigned to trainer
// @route   GET /api/trainers/classes
// @access  Trainer
const getTrainerClasses = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ user: req.user.id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer profile not found'
            });
        }

        const sessions = await Session.find({ trainer: trainer._id }).sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error('Get trainer classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching classes'
        });
    }
};

const updateTrainerProfile = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ user: req.user.id });

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: 'Trainer profile not found'
            });
        }

        const { name, email, phone, gender, specialization, bio, experience } = req.body;

        // Update fields
        if (name) trainer.name = name;
        if (email) trainer.email = email.toLowerCase();
        if (phone) trainer.phone = phone;
        if (specialization) trainer.specialization = specialization;
        if (bio) trainer.bio = bio;
        if (experience) trainer.experience = experience;

        await trainer.save();

        // Update linked User account
        if (trainer.user) {
            const userUpdate = {};
            if (name) userUpdate.name = name;
            if (email) userUpdate.email = email.toLowerCase();
            if (gender) userUpdate.gender = gender;

            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(trainer.user, userUpdate);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: trainer
        });
    } catch (error) {
        console.error('Update trainer profile error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

module.exports = {
    getTrainers,
    getTrainer,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    getTrainerProfile,
    getTrainerClasses,
    updateTrainerProfile
};
