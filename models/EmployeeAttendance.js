const mongoose = require('mongoose');

const employeeAttendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'On Permission', 'Absent'],
        default: 'Present'
    },
    note: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Ensure one attendance record per employee per day
employeeAttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeAttendance', employeeAttendanceSchema);
