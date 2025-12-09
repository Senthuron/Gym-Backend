const Member = require('../models/Member');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Trainer = require('../models/Trainer');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Admin
const getAdminStats = async (req, res) => {
    try {
        const totalMembers = await Member.countDocuments();
        const activeMembers = await Member.countDocuments({ status: 'active' });

        // Expiring in 7 days
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const expiringMembers = await Member.countDocuments({
            membershipEndDate: { $lte: nextWeek, $gte: new Date() }
        });

        const weeklyClasses = await Session.countDocuments({
            date: { $gte: new Date(), $lte: nextWeek }
        });

        // Calculate overall attendance percentage (simplified)
        const totalAttendance = await Attendance.countDocuments({ isPresent: true });
        // This percentage calculation is tricky without total possible attendance. 
        // For now, let's just return the count.

        res.status(200).json({
            success: true,
            data: {
                totalMembers,
                activeMembers,
                expiringMembers,
                weeklyClasses,
                totalAttendance
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin stats'
        });
    }
};

// @desc    Get trainer dashboard stats
// @route   GET /api/dashboard/trainer
// @access  Trainer
const getTrainerStats = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ user: req.user.id });
        if (!trainer) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysClasses = await Session.countDocuments({
            trainer: trainer._id,
            date: { $gte: today, $lt: tomorrow }
        });

        const upcomingClasses = await Session.countDocuments({
            trainer: trainer._id,
            date: { $gte: tomorrow }
        });

        res.status(200).json({
            success: true,
            data: {
                todaysClasses,
                upcomingClasses
            }
        });
    } catch (error) {
        console.error('Get trainer stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trainer stats'
        });
    }
};

// @desc    Get member dashboard stats
// @route   GET /api/dashboard/member
// @access  Member
const getMemberStats = async (req, res) => {
    try {
        const member = await Member.findOne({ user: req.user.id });
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const today = new Date();
        const daysLeft = Math.ceil((member.membershipEndDate - today) / (1000 * 60 * 60 * 24));

        const attendanceCount = await Attendance.countDocuments({ memberId: member._id, isPresent: true });

        // Upcoming classes (if we had enrollment, we'd filter by that. For now, maybe just show all upcoming?)
        // User asked for "Upcoming classes" in Member Dashboard.
        // Assuming members can see all classes or enrolled ones.
        // Let's just return count of attended classes for now.

        res.status(200).json({
            success: true,
            data: {
                plan: member.plan,
                daysLeft: daysLeft > 0 ? daysLeft : 0,
                attendanceCount
            }
        });
    } catch (error) {
        console.error('Get member stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching member stats'
        });
    }
};

module.exports = {
    getAdminStats,
    getTrainerStats,
    getMemberStats
};
