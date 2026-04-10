const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            required: [true, 'Day is required'],
            enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be in HH:mm format']
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be in HH:mm format']
        }
    },
    { _id: false }
);

const AvailabilitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        weeklySlots: {
            type: [SlotSchema],
            default: []
        },
        blockedDates: {
            type: [Date],
            default: []
        },
        timezone: {
            type: String,
            default: 'UTC',
            trim: true
        }
    },
    { timestamps: true }
);

AvailabilitySchema.index({ userId: 1 });

module.exports = mongoose.model('Availability', AvailabilitySchema);
