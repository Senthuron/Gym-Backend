const Session = require('../models/Session');

// @desc    Get all sessions with filters
// @route   GET /api/sessions
// @access  Protected
const getSessions = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        let query = {};

        // Filter by date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const sessions = await Session.find(query).sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Protected
const createSession = async (req, res) => {
    try {
        const { name, trainer, date, startTime, capacity, startingdate, location } = req.body;

        // Validate required fields
        if (!name || !trainer || !date || !startTime || !capacity || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate capacity
        if (capacity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be at least 1'
            });
        }

        // Create session
        const session = await Session.create({
            name,
            trainer, // Assuming this is an ID now
            date: new Date(date),
            startTime,
            capacity,
            status: 'Scheduled',
            startingdate: startingdate ? new Date(startingdate) : undefined,
            location
        });

        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            data: session
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating session'
        });
    }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Protected
const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, trainer, date, startTime, capacity, status, startingdate, location } = req.body;

        // Find session
        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Validate capacity if provided
        if (capacity && capacity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be at least 1'
            });
        }

        // Update fields
        if (name) session.name = name;
        if (trainer) session.trainer = trainer;
        if (date) session.date = new Date(date);
        if (startTime) session.startTime = startTime;
        if (capacity) session.capacity = capacity;
        if (status) session.status = status;
        if (startingdate) session.startingdate = new Date(startingdate);
        if (location) session.location = location;

        await session.save();

        res.status(200).json({
            success: true,
            message: 'Session updated successfully',
            data: session
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating session'
        });
    }
};

// @desc    Cancel session
// @route   PUT /api/sessions/:id/cancel
// @access  Protected
const cancelSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        session.status = 'Cancelled';
        await session.save();

        res.status(200).json({
            success: true,
            message: 'Session cancelled successfully',
            data: session
        });
    } catch (error) {
        console.error('Cancel session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling session'
        });
    }
};

module.exports = {
    getSessions,
    createSession,
    updateSession,
    cancelSession
};
