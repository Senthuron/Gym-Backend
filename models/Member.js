const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
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
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Others']
    },
    age: {
        type: Number,
        min: [1, 'Age must be at least 1'],
        max: [150, 'Age must be less than 150']
    },
    weight: {
        type: Number,
        min: [1, 'Weight must be at least 1'],
        max: [1000, 'Weight must be less than 1000']
    },
    membershipStartDate: {
        type: Date,
        required: [true, 'Membership start date is required']
    },
    membershipEndDate: {
        type: Date,
        required: [true, 'Membership end date is required']
    },
    plan: {
        type: String,
        required: [true, 'Plan is required']
    },
    class: {
        type: String,
        required: [true, 'Class is required'],
        trim: true
    },
    classType: {
        type: String,
        required: [true, 'Class type is required'],
        enum: ['Cardio', 'Strength', 'Yoga', 'Flexibility', 'HIIT', 'Other'],
        default: 'Cardio'
    },
    difficultyLevel: {
        type: String,
        required: [true, 'Difficulty level is required'],
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    status: {
        type: String,
        enum: ['active', 'Deactive', 'pending'],
        default: 'active'
    },
    nextBillingDate: {
        type: Date
    },
    lastAttended: {
        type: Date
    },
    totalAttendance: {
        type: Number,
        default: 0
    },
    workoutPlan: {
        weeklySchedule: [{
            day: String,
            exercises: [{
                name: String,
                sets: String,
                reps: String,
                notes: String
            }]
        }],
        trainerNotes: String
    },
    dietPlan: {
        dietChart: String, // Text or URL to PDF
        mealTiming: [{
            meal: String,
            time: String,
            notes: String
        }],
        nutritionNotes: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to check if membership is active
memberSchema.virtual('isActive').get(function () {
    return new Date() <= new Date(this.membershipEndDate);
});

// Virtual field to calculate days until expiration
memberSchema.virtual('daysUntilExpiration').get(function () {
    const today = new Date();
    const endDate = new Date(this.membershipEndDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Index for faster queries
memberSchema.index({ membershipEndDate: 1 });

module.exports = mongoose.model('Member', memberSchema);
