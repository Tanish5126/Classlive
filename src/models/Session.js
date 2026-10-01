// Session model schema representing a live meeting of a class
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required']
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required']
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'scheduled'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    }
  },
  {
    timestamps: true
  }
);

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
