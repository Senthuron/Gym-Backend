const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Session ID is required']
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Member ID is required']
    },
    isPresent: {
        type: Boolean,
        default: true
    },
    dateAttended: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ sessionId: 1, memberId: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ sessionId: 1 });
attendanceSchema.index({ memberId: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
