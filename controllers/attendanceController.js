const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Admin, Trainer
const markAttendance = async (req, res) => {
    try {
        const { sessionId, memberId, isPresent } = req.body;

        if (!sessionId || !memberId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID and Member ID are required'
            });
        }

        // Verify session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // If Trainer, verify they own the session
        if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ user: req.user.id });
            if (!trainer || session.trainer.toString() !== trainer._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this session' });
            }
        }

        // Update or create attendance record
        const attendance = await Attendance.findOneAndUpdate(
            { sessionId, memberId },
            { isPresent: isPresent !== undefined ? isPresent : true, dateAttended: new Date() },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendance
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance'
        });
    }
};

// @desc    Get attendance for a session
// @route   GET /api/attendance/session/:sessionId
// @access  Admin, Trainer
const getSessionAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // If Trainer, verify ownership
        if (req.user.role === 'trainer') {
            const trainer = await Trainer.findOne({ user: req.user.id });
            if (!trainer || session.trainer.toString() !== trainer._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
        }

        const attendance = await Attendance.find({ sessionId }).populate('memberId', 'name email');

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        console.error('Get session attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance'
        });
    }
};

// @desc    Get member attendance history
// @route   GET /api/attendance/member
// @access  Member
const getMemberAttendance = async (req, res) => {
    try {
        const member = await Member.findOne({ user: req.user.id });
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const attendance = await Attendance.find({ memberId: member._id })
            .populate('sessionId', 'name date startTime')
            .sort({ dateAttended: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        console.error('Get member attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance'
        });
    }
};

module.exports = {
    markAttendance,
    getSessionAttendance,
    getMemberAttendance
};
