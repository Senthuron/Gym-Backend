const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        required: [true, 'Difficulty is required']
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trainer ID is required']
    },
    traineeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trainee ID is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    workoutDays: [{
        dayName: {
            type: String,
            required: [true, 'Day name is required'] // e.g., Monday, Day 1
        },
        focus: {
            type: String,
            required: [true, 'Focus is required'] // e.g., Chest, Cardio
        },
        exercises: [{
            name: {
                type: String,
                required: [true, 'Exercise name is required']
            },
            sets: {
                type: String,
                required: [true, 'Sets are required']
            },
            reps: {
                type: String,
                required: [true, 'Reps are required']
            },
            restTime: {
                type: String // e.g., "60 seconds"
            }
        }]
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
