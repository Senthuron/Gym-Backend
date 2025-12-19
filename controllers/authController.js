const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Member = require('../models/Member');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            confirmPassword,
            role,
            gender,
            // Trainee-specific fields
            membershipStartDate,
            membershipEndDate,
            plan,
            class: className,
            classType,
            difficultyLevel,
            age,
            weight
        } = req.body;

        // Validate input
        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, phone, password, and confirm password'
            });
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Validate role if provided
        const userRole = role || 'member';
        if (!['admin', 'trainer', 'member'].includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "admin", "trainer", or "member"'
            });
        }

        // For trainees, validate required fields
        if (userRole === 'member') {
            if (!membershipStartDate || !membershipEndDate || !plan || !className) {
                return res.status(400).json({
                    success: false,
                    message: 'For trainees, please provide membership start date, end date, plan, and class'
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

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password,
            role: userRole,
            gender
        });

        // If trainee, create member record with auto-calculated next billing date
        if (userRole === 'member') {
            const startDate = new Date(membershipStartDate);
            const nextBillingDate = new Date(startDate);
            nextBillingDate.setDate(nextBillingDate.getDate() + 30); // 30 days from start date

            try {
                await Member.create({
                    user: user._id,
                    name,
                    email: email.toLowerCase(),
                    phone,
                    gender,
                    age: age ? parseInt(age) : undefined,
                    weight: weight ? parseFloat(weight) : undefined,
                    membershipStartDate: startDate,
                    membershipEndDate: new Date(membershipEndDate),
                    plan,
                    class: className,
                    classType: classType || 'Cardio',
                    difficultyLevel: difficultyLevel || 'Beginner',
                    status: 'active',
                    nextBillingDate: nextBillingDate
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
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

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
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user (admin or user)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Forgot password - Send OTP to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email });

        // Save OTP to database
        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        // Send OTP via email
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please check your inbox.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP. Please try again later.'
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Find OTP
        const otpRecord = await OTP.findOne({
            email: email.trim().toLowerCase(),
            otp: otp.toString().trim()
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        let { email, otp, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, new password, and confirm password'
            });
        }

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Find and verify OTP
        const otpRecord = await OTP.findOne({
            email: email.trim().toLowerCase(),
            otp: otp.toString().trim(),
            verified: true
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or unverified OTP. Please verify OTP first.'
            });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password using findByIdAndUpdate to avoid validation issues
        await User.findByIdAndUpdate(
            user._id,
            { password: hashedPassword },
            { runValidators: false }
        );

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password, new password, and confirm password'
            });
        }

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        // Get user (with password)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password using findByIdAndUpdate to avoid validation issues
        await User.findByIdAndUpdate(
            user._id,
            { password: hashedPassword },
            { runValidators: false }
        );

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let memberData = null;
        if (user.role === 'member') {
            memberData = await Member.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                memberDetails: memberData
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updatePassword,
    getMe
};
