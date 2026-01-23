const Employee = require('../models/Employee');
const User = require('../models/User');
const Trainer = require('../models/Trainer');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Admin
const getEmployees = async (req, res) => {
    try {
        // Sync Trainers: Find all users with role 'trainer'
        const trainerUsers = await User.find({ role: 'trainer' });

        for (const user of trainerUsers) {
            // 1. Ensure Trainer profile exists
            let trainer = await Trainer.findOne({ user: user._id });
            if (!trainer) {
                trainer = await Trainer.create({
                    user: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || 'N/A'
                });
            }

            // 2. Ensure Employee record exists
            let employee = await Employee.findOne({ email: user.email.toLowerCase() });
            if (!employee) {
                employee = await Employee.create({
                    name: user.name,
                    email: user.email.toLowerCase(),
                    phone: user.phone || 'N/A',
                    role: 'Trainer',
                    salaryType: 'Monthly',
                    baseSalary: 0,
                    status: 'Active',
                    user: user._id,
                    gender: user.gender || 'Others',
                    specialization: trainer.specialization,
                    bio: trainer.bio,
                    experience: trainer.experience
                });
            } else {
                // Sync details from Trainer to Employee if they are missing
                let updated = false;
                if (!employee.specialization && trainer.specialization) {
                    employee.specialization = trainer.specialization;
                    updated = true;
                }
                if (!employee.bio && trainer.bio) {
                    employee.bio = trainer.bio;
                    updated = true;
                }
                if (!employee.experience && trainer.experience) {
                    employee.experience = trainer.experience;
                    updated = true;
                }
                if (!employee.user) {
                    employee.user = user._id;
                    updated = true;
                }
                if (updated) await employee.save();
            }
        }

        const employees = await Employee.find().populate('user', 'name email role').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees'
        });
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Admin
const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('user', 'name email role');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee'
        });
    }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Admin
const createEmployee = async (req, res) => {
    try {
        const { name, email, phone, role, gender, salaryType, baseSalary, status, joiningDate, specialization, bio, experience } = req.body;

        if (!name || !email || !phone || !role || !gender || !salaryType || !baseSalary) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if employee with this email already exists
        const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists'
            });
        }

        // Create Employee
        const employee = await Employee.create({
            name,
            email: email.toLowerCase(),
            phone,
            role,
            gender,
            salaryType,
            baseSalary,
            status: status || 'Active',
            joiningDate: joiningDate || Date.now(),
            specialization,
            bio,
            experience
        });
        console.log(employee)

        // If role is Trainer, Reception, or Manager, create/link a User account
        if (['Trainer', 'Reception', 'Manager'].includes(role)) {
            let user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                user = await User.create({
                    name,
                    email: email.toLowerCase(),
                    phone,
                    gender,
                    password: 'password123', // Default password
                    role: role.toLowerCase()
                });
            }
            employee.user = user._id;
            await employee.save();

            // If role is Trainer, also create/update Trainer profile
            if (role === 'Trainer') {
                await Trainer.findOneAndUpdate(
                    { email: email.toLowerCase() },
                    {
                        user: user._id,
                        name,
                        email: email.toLowerCase(),
                        phone,
                        specialization,
                        bio,
                        experience
                    },
                    { upsert: true, new: true }
                );
            }
        }

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating employee'
        });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin
const updateEmployee = async (req, res) => {
    try {
        const { name, email, phone, role, gender, specialization, bio, experience } = req.body;
        let employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const oldEmail = employee.email;

        employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Sync with User and Trainer models if necessary
        if (employee.user || ['Trainer', 'Reception', 'Manager'].includes(employee.role)) {
            let user = employee.user ? await User.findById(employee.user) : await User.findOne({ email: oldEmail });

            if (user) {
                if (name) user.name = name;
                if (email) user.email = email.toLowerCase();
                if (phone) user.phone = phone;
                if (role) user.role = role.toLowerCase();
                if (gender) user.gender = gender;
                await user.save();
            } else if (['Trainer', 'Reception', 'Manager'].includes(employee.role)) {
                // Create user if it doesn't exist but role requires it
                user = await User.create({
                    name: employee.name,
                    email: employee.email,
                    phone: employee.phone,
                    gender: employee.gender,
                    password: 'password123',
                    role: employee.role.toLowerCase()
                });
                employee.user = user._id;
                await employee.save();
            }

            if (employee.role === 'Trainer' && user) {
                await Trainer.findOneAndUpdate(
                    { user: user._id },
                    {
                        name: employee.name,
                        email: employee.email,
                        phone: employee.phone,
                        specialization: employee.specialization,
                        bio: employee.bio,
                        experience: employee.experience
                    },
                    { upsert: true, new: true }
                );
            }
        }

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating employee'
        });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Admin
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        await Employee.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting employee'
        });
    }
};

module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
