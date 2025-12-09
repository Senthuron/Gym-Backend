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
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    nextBillingDate: {
        type: Date
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

// Index for faster queries
memberSchema.index({ membershipEndDate: 1 });

module.exports = mongoose.model('Member', memberSchema);
