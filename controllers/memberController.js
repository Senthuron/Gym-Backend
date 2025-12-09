const Member = require('../models/Member');
const User = require('../models/User');

// @desc    Get all members with search and filter
// @route   GET /api/members
// @access  Protected
const getMembers = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status (DB field)
        if (status && ['active', 'inactive', 'pending'].includes(status)) {
            query.status = status;
        }

        // Get members
        let members = await Member.find(query).sort({ createdAt: -1 });

        // Filter by expired status (virtual field)
        if (status === 'expired') {
            members = members.filter(member => !member.isActive);
        }

        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching members'
        });
    }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Protected
const createMember = async (req, res) => {
    try {
        const { name, email, phone, membershipStartDate, membershipEndDate, plan, status, nextBillingDate } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !membershipStartDate || !membershipEndDate || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
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

        // Validate dates
        const startDate = new Date(membershipStartDate);
        const endDate = new Date(membershipEndDate);

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: 'Membership end date must be after start date'
            });
        }

        // Create User account
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: 'password123', // Default password, should be changed by user
            role: 'member'
        });

        // Create member
        const member = await Member.create({
            user: user._id,
            name,
            email: email.toLowerCase(),
            phone,
            membershipStartDate: startDate,
            membershipEndDate: endDate,
            plan,
            status: status || 'active',
            nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : undefined
        });

        res.status(201).json({
            success: true,
            message: 'Member created successfully. Default password is "password123"',
            data: member
        });
    } catch (error) {
        console.error('Create member error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Member with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating member'
        });
    }
};

// @desc    Get current member profile
// @route   GET /api/members/profile
// @access  Member
const getMemberProfile = async (req, res) => {
    try {
        const member = await Member.findOne({ user: req.user.id });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: member
        });
    } catch (error) {
        console.error('Get member profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Protected
const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, membershipStartDate, membershipEndDate, plan, status, nextBillingDate } = req.body;

        // Find member
        const member = await Member.findById(id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Validate dates if provided
        if (membershipStartDate && membershipEndDate) {
            const startDate = new Date(membershipStartDate);
            const endDate = new Date(membershipEndDate);

            if (endDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Membership end date must be after start date'
                });
            }
        }

        // Update fields
        if (name) member.name = name;
        if (email) member.email = email.toLowerCase();
        if (phone) member.phone = phone;
        if (membershipStartDate) member.membershipStartDate = new Date(membershipStartDate);
        if (membershipEndDate) member.membershipEndDate = new Date(membershipEndDate);
        if (plan) member.plan = plan;
        if (status) member.status = status;
        if (nextBillingDate) member.nextBillingDate = new Date(nextBillingDate);

        await member.save();

        // Update linked User account
        if (member.user) {
            const userUpdate = {};
            if (name) userUpdate.name = name;
            if (email) userUpdate.email = email.toLowerCase();

            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(member.user, userUpdate);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Member updated successfully',
            data: member
        });
    } catch (error) {
        console.error('Update member error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Member with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating member'
        });
    }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Protected
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await Member.findById(id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Delete associated User if exists
        if (member.user) {
            await User.findByIdAndDelete(member.user);
        }

        await Member.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting member'
        });
    }
};

module.exports = {
    getMembers,
    createMember,
    updateMember,
    deleteMember,
    getMemberProfile
};
