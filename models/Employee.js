const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['Trainer', 'Reception', 'Manager', 'Cleaner']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Others']
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    salaryType: {
        type: String,
        required: [true, 'Salary type is required'],
        enum: ['Monthly', 'Per-class', 'Per-hour']
    },
    baseSalary: {
        type: Number,
        required: [true, 'Base salary is required']
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'On Permission', 'Resigned'],
        default: 'Active'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Trainer specific fields
    specialization: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Auto-generate employeeId before saving
employeeSchema.pre('validate', async function (next) {
    if (this.isNew && !this.employeeId) {
        try {
            const lastEmployee = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
            let newId = 'EMP-001';
            if (lastEmployee && lastEmployee.employeeId) {
                const lastIdNumber = parseInt(lastEmployee.employeeId.split('-')[1]);
                newId = `EMP-${String(lastIdNumber + 1).padStart(3, '0')}`;
            }
            this.employeeId = newId;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Employee', employeeSchema);
