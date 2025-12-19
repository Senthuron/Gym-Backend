const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    traineeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    type: {
        type: String,
        enum: ['TRAINER', 'CLASS'],
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    suggestion: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'HIDDEN'],
        default: 'ACTIVE'
    }
}, {
    timestamps: true
});

// Either trainerId OR classId is required
feedbackSchema.pre('validate', function (next) {
    if (!this.trainerId && !this.classId) {
        next(new Error('Either trainerId or classId is required'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
