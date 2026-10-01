// Submission controller handling quiz submission, automatic grading, and results retrieval
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');

// @desc    Submit answers for a quiz (graded automatically)
// @route   POST /api/submissions
// @access  Private (Student only)
const createSubmission = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return next(new ApiError(404, 'Quiz not found'));
    }

    // Check if the student has already submitted this quiz
    const existingSubmission = await Submission.findOne({
      quiz: quizId,
      student: req.user._id
    });

    if (existingSubmission) {
      return next(new ApiError(400, 'You have already submitted this quiz'));
    }

    // Automatically grade answers against correct answers stored in quiz
    let score = 0;
    const total = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      if (answers[index] !== undefined && Number(answers[index]) === question.correctAnswer) {
        score += 1;
      }
    });

    const submission = await Submission.create({
      quiz: quizId,
      student: req.user._id,
      answers,
      score,
      total
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted and graded successfully',
      data: {
        submission
      }
    });
  } catch (error) {
    // Catch unique compound index duplicate key error
    if (error.code === 11000) {
      return next(new ApiError(400, 'You have already submitted this quiz'));
    }
    next(error);
  }
};

// @desc    Get all submissions (optional ?quizId= filter)
// @route   GET /api/submissions
// @access  Private (Teacher only)
const getSubmissions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.quizId) {
      filter.quiz = req.query.quizId;
    }

    const submissions = await Submission.find(filter)
      .populate('quiz', 'title class')
      .populate('student', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully',
      data: {
        submissions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions by student ID
// @route   GET /api/submissions/student/:id
// @access  Private (Student for own submissions, or any Teacher)
const getStudentSubmissions = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Students are restricted to their own ID; teachers can view any
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return next(new ApiError(403, 'Not authorized to view other students\' submissions'));
    }

    const submissions = await Submission.find({ student: studentId })
      .populate('quiz', 'title class')
      .populate('student', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Student submissions fetched successfully',
      data: {
        submissions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
  getStudentSubmissions
};
