const Member = require('../models/Member');
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const { sendCredentialsEmail } = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Get all users (Admins, Trainers, Members) with their roles
// @route   GET /api/members
// @access  Protected (Admin/Trainer)
const getMembers = async (req, res) => {
    try {
        const { search, status, role } = req.query;

        // Build user query
        let userQuery = {};
        if (search) {
            userQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role && ['admin', 'trainer', 'member'].includes(role)) {
            userQuery.role = role;
        }

        // Get all users
        const users = await User.find(userQuery).select('-password').sort({ createdAt: -1 });

        // Get user IDs for filtering
        const userIds = users.map(u => u._id);

        // Get members and trainers only for the filtered users
        const members = await Member.find({ user: { $in: userIds } }).populate('user', 'name email role');
        const trainers = await Trainer.find({ user: { $in: userIds } }).populate('user', 'name email role');

        // Create a map for quick lookup
        const memberMap = new Map();
        members.forEach(m => {
            if (m.user && m.user._id) {
                memberMap.set(m.user._id.toString(), m);
            }
        });

        const trainerMap = new Map();
        trainers.forEach(t => {
            if (t.user && t.user._id) {
                trainerMap.set(t.user._id.toString(), t);
            }
        });

        // Combine users with their role-specific data
        const usersWithDetails = users.map(user => {
            const userObj = user.toObject();
            const userId = user._id.toString();

            if (user.role === 'member' && memberMap.has(userId)) {
                const memberData = memberMap.get(userId);
                return {
                    _id: memberData._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: memberData.phone || '',
                    plan: memberData.plan || '',
                    status: memberData.status || 'active',
                    isActive: memberData.isActive,
                    membershipStartDate: memberData.membershipStartDate,
                    membershipEndDate: memberData.membershipEndDate,
                    nextBillingDate: memberData.nextBillingDate,
                    class: memberData.class || '',
                    classType: memberData.classType || '',
                    difficultyLevel: memberData.difficultyLevel || '',
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            } else if (user.role === 'trainer' && trainerMap.has(userId)) {
                const trainerData = trainerMap.get(userId);
                return {
                    _id: trainerData._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: trainerData.phone || '',
                    plan: '',
                    status: 'active',
                    isActive: true,
                    membershipStartDate: null,
                    membershipEndDate: null,
                    nextBillingDate: null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            } else if (user.role === 'admin') {
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: '',
                    plan: '',
                    status: 'active',
                    isActive: true,
                    membershipStartDate: null,
                    membershipEndDate: null,
                    nextBillingDate: null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            }

            // Fallback for users without role-specific data
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: '',
                plan: '',
                status: 'active',
                isActive: true,
                membershipStartDate: null,
                membershipEndDate: null,
                nextBillingDate: null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        });

        // Apply status filter if provided
        let filteredUsers = usersWithDetails;
        if (status && ['active', 'inactive', 'expired', 'pending'].includes(status)) {
            if (status === 'expired') {
                filteredUsers = usersWithDetails.filter(u => u.role === 'member' && !u.isActive);
            } else if (status === 'active') {
                // Include if status is explicitly active (case-insensitive)
                // OR if status is NOT inactive/pending AND membership is active
                filteredUsers = usersWithDetails.filter(u => {
                    const s = (u.status || '').toLowerCase();
                    if (s === 'active') return true;
                    if (s === 'inactive' || s === 'pending') return false;
                    return u.isActive !== false; // Fallback for undefined status
                });
            } else if (status === 'inactive') {
                filteredUsers = usersWithDetails.filter(u => (u.status || '').toLowerCase() === 'inactive');
            } else if (status === 'pending') {
                filteredUsers = usersWithDetails.filter(u => (u.status || '').toLowerCase() === 'pending');
            }
        }

        res.status(200).json({
            success: true,
            count: filteredUsers.length,
            data: filteredUsers
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// Generate secure random password
const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const randomBytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
};

// @desc    Create new user (Admin, Trainer, or Member)
// @route   POST /api/members
// @access  Protected (Admin only)
const createMember = async (req, res) => {
    try {
        const { name, email, phone, role, membershipStartDate, membershipEndDate, plan, status, nextBillingDate, class: className, classType, difficultyLevel, age, weight } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and email'
            });
        }

        // Validate role
        const validRoles = ['admin', 'trainer', 'member'];
        const userRole = role || 'member';
        if (!validRoles.includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be admin, trainer, or member'
            });
        }

        // Phone is required for trainer and member, optional for admin
        if ((userRole === 'trainer' || userRole === 'member') && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required for trainers and members'
            });
        }

        // For members, validate membership dates, plan, and class
        if (userRole === 'member') {
            if (!membershipStartDate || !membershipEndDate || !plan || !className) {
                return res.status(400).json({
                    success: false,
                    message: 'Membership dates, plan, and class are required for members'
                });
            }

            const startDate = new Date(membershipStartDate);
            const endDate = new Date(membershipEndDate);

            if (endDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Membership end date must be after start date'
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Check if member already exists (for member role)
        if (userRole === 'member') {
            const existingMember = await Member.findOne({ email: email.toLowerCase() });
            if (existingMember) {
                return res.status(400).json({
                    success: false,
                    message: 'A member with this email already exists'
                });
            }
        }

        // Generate secure password
        const generatedPassword = generatePassword();

        // Create User account
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            password: generatedPassword,
            role: userRole
        });

        let createdRecord = null;

        // Create role-specific records
        if (userRole === 'member') {
            const startDate = new Date(membershipStartDate);
            const endDate = new Date(membershipEndDate);

            // Auto-calculate next billing date: 30 days from start date
            const calculatedNextBillingDate = new Date(startDate);
            calculatedNextBillingDate.setDate(calculatedNextBillingDate.getDate() + 30);

            try {
                createdRecord = await Member.create({
                    user: user._id,
                    name,
                    email: email.toLowerCase(),
                    phone,
                    age: age ? parseInt(age) : undefined,
                    weight: weight ? parseFloat(weight) : undefined,
                    membershipStartDate: startDate,
                    membershipEndDate: endDate,
                    plan,
                    class: className,
                    classType: classType || 'Cardio',
                    difficultyLevel: difficultyLevel || 'Beginner',
                    status: status || 'active',
                    nextBillingDate: calculatedNextBillingDate
                });
            } catch (memberError) {
                // If member creation fails, delete the user to maintain consistency
                await User.findByIdAndDelete(user._id);

                // Handle duplicate key error specifically
                if (memberError.code === 11000) {
                    return res.status(400).json({
                        success: false,
                        message: 'A member with this email already exists'
                    });
                }
                throw memberError; // Re-throw if it's a different error
            }
        } else if (userRole === 'trainer') {
            try {
                createdRecord = await Trainer.create({
                    user: user._id,
                    name,
                    email: email.toLowerCase(),
                    phone
                });
            } catch (trainerError) {
                // If trainer creation fails, delete the user to maintain consistency
                await User.findByIdAndDelete(user._id);

                // Handle duplicate key error specifically
                if (trainerError.code === 11000) {
                    return res.status(400).json({
                        success: false,
                        message: 'A trainer with this email already exists'
                    });
                }
                throw trainerError; // Re-throw if it's a different error
            }
        } else if (userRole === 'admin') {
            // Admin doesn't need additional record, just User
            createdRecord = user;
        }

        // Send credentials email
        try {
            await sendCredentialsEmail(email, name, generatedPassword, userRole);
        } catch (emailError) {
            console.error('Failed to send credentials email:', emailError);
            // Don't fail the request if email fails, but log it
        }

        res.status(201).json({
            success: true,
            message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} created successfully. Login credentials have been sent to ${email}`,
            data: createdRecord
        });
    } catch (error) {
        console.error('Create user error:', error);

        // Handle duplicate key errors with more specific messages
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'email';
            return res.status(400).json({
                success: false,
                message: `A user with this ${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
};

// @desc    Get current member profile
// @route   GET /api/members/profile
// @access  Member
const getMemberProfile = async (req, res) => {
    try {
        const member = await Member.findOne({ user: req.user.id }).populate('user', 'name email role');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found'
            });
        }

        // Return member data with user info
        const memberData = {
            _id: member._id,
            name: member.name,
            email: member.email,
            role: member.user?.role || 'member',
            phone: member.phone || '',
            age: member.age,
            weight: member.weight,
            plan: member.plan || '',
            status: member.status || 'active',
            isActive: member.isActive,
            daysUntilExpiration: member.daysUntilExpiration,
            membershipStartDate: member.membershipStartDate,
            membershipEndDate: member.membershipEndDate,
            nextBillingDate: member.nextBillingDate,
            class: member.class || '',
            classType: member.classType || '',
            difficultyLevel: member.difficultyLevel || '',
            createdAt: member.createdAt,
            updatedAt: member.updatedAt
        };

        res.status(200).json({
            success: true,
            data: memberData
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
// @desc    Update member/user
// @route   PUT /api/members/:id
// @access  Protected
const updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, membershipStartDate, membershipEndDate, plan, status, nextBillingDate, class: className, classType, difficultyLevel, age, weight } = req.body;

        let user = await User.findById(id);
        let member = null;
        let trainer = null;

        // If found by User ID
        if (user) {
            if (user.role === 'member') {
                member = await Member.findOne({ user: user._id });
                // Self-healing: Create member if missing
                if (!member) {
                    console.log(`Creating missing Member record for user ${user._id}`);
                    member = new Member({
                        user: user._id,
                        name: user.name,
                        email: user.email,
                        // Set defaults or use provided values
                        membershipStartDate: membershipStartDate || new Date(),
                        membershipEndDate: membershipEndDate || new Date(),
                        plan: plan || 'Standard',
                        status: status || 'active',
                        class: className || '',
                        classType: classType || 'Cardio',
                        difficultyLevel: difficultyLevel || 'Beginner'
                    });
                }
            } else if (user.role === 'trainer') {
                trainer = await Trainer.findOne({ user: user._id });
                // Self-healing: Create trainer if missing
                if (!trainer) {
                    console.log(`Creating missing Trainer record for user ${user._id}`);
                    trainer = new Trainer({
                        user: user._id,
                        name: user.name,
                        email: user.email,
                        phone: phone || ''
                    });
                }
            }
        } else {
            // Fallback: Try to find by Member ID (legacy support)
            member = await Member.findById(id);
            if (member) {
                user = await User.findById(member.user);
            }
        }

        if (!user && !member) {
            return res.status(404).json({
                success: false,
                message: 'User/Member not found'
            });
        }

        // Validate dates if provided (only for members)
        if ((member || user?.role === 'member') && membershipStartDate && membershipEndDate) {
            const startDate = new Date(membershipStartDate);
            const endDate = new Date(membershipEndDate);

            if (endDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Membership end date must be after start date'
                });
            }
        }

        // Update User fields
        if (user) {
            if (name) user.name = name;
            if (email) user.email = email.toLowerCase();
            if (phone) user.phone = phone; // Phone is stored in User too
            await user.save();
        }

        // Update Member fields
        if (member) {
            if (name) member.name = name; // Sync name
            if (email) member.email = email.toLowerCase(); // Sync email
            if (phone) member.phone = phone;
            if (age !== undefined) member.age = age ? parseInt(age) : null;
            if (weight !== undefined) member.weight = weight ? parseFloat(weight) : null;
            if (membershipStartDate) member.membershipStartDate = new Date(membershipStartDate);
            if (membershipEndDate) member.membershipEndDate = new Date(membershipEndDate);
            if (plan) member.plan = plan;
            if (status) member.status = status;
            if (nextBillingDate) member.nextBillingDate = new Date(nextBillingDate);
            if (className !== undefined) member.class = className;
            if (classType !== undefined) member.classType = classType;
            if (difficultyLevel !== undefined) member.difficultyLevel = difficultyLevel;
            await member.save();
        }

        // Update Trainer fields
        if (trainer) {
            if (name) trainer.name = name; // Sync name
            if (email) trainer.email = email.toLowerCase(); // Sync email
            if (phone) trainer.phone = phone;
            await trainer.save();
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: member || trainer || user
        });
    } catch (error) {
        console.error('Update member error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
};

// @desc    Delete member/user
// @route   DELETE /api/members/:id
// @access  Protected
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params;

        let user = await User.findById(id);
        let member = null;
        let trainer = null;

        // If found by User ID
        if (user) {
            if (user.role === 'member') {
                member = await Member.findOne({ user: user._id });
            } else if (user.role === 'trainer') {
                trainer = await Trainer.findOne({ user: user._id });
            }
        } else {
            // Fallback: Try to find by Member ID
            member = await Member.findById(id);
            if (member) {
                user = await User.findById(member.user);
            } else {
                // Fallback: Try to find by Trainer ID
                trainer = await Trainer.findById(id);
                if (trainer) {
                    user = await User.findById(trainer.user);
                }
            }
        }

        if (!user && !member && !trainer) {
            return res.status(404).json({
                success: false,
                message: 'User/Member not found'
            });
        }

        // Delete associated records
        if (member) {
            await Member.findByIdAndDelete(member._id);
        }

        if (trainer) {
            await Trainer.findByIdAndDelete(trainer._id);
        }

        // Delete User
        if (user) {
            await User.findByIdAndDelete(user._id);
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// @desc    Update current member profile
// @route   PUT /api/members/profile
// @access  Member
const updateMemberProfile = async (req, res) => {
    try {
        const member = await Member.findOne({ user: req.user.id });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found'
            });
        }

        const { name, email, phone, age, weight } = req.body;

        // Update fields
        if (name) member.name = name;
        if (email) member.email = email.toLowerCase();
        if (phone) member.phone = phone;
        if (age !== undefined) member.age = age ? parseInt(age) : null;
        if (weight !== undefined) member.weight = weight ? parseFloat(weight) : null;

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
            message: 'Profile updated successfully',
            data: member
        });
    } catch (error) {
        console.error('Update member profile error:', error);
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
    getMembers,
    createMember,
    updateMember,
    deleteMember,
    getMemberProfile,
    updateMemberProfile
};
