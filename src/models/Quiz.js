// Quiz model schema representing tests created by teachers for a class
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: [
        (val) => Array.isArray(val) && val.length >= 2,
        'Each question must have at least 2 options'
      ]
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required']
    }
  },
  {
    _id: true
  }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required']
    },
    questions: {
      type: [questionSchema],
      required: [true, 'Questions are required'],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'Quiz must contain at least one question'
      ]
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

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
