const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['WEIGHT_LOSS', 'WEIGHT_GAIN', 'MUSCLE_BUILD', 'MAINTENANCE'],
        required: [true, 'Plan type is required']
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
    notes: {
        type: String,
        trim: true
    },
    meals: [{
        name: {
            type: String,
            required: [true, 'Meal name is required'] // e.g., Breakfast, Lunch
        },
        description: {
            type: String,
            required: [true, 'Meal description is required']
        },
        calories: {
            type: Number
        },
        nutritionNotes: {
            type: String
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
