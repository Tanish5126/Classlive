// Quiz controller handling quiz creation, retrieval, updates, and deletion
const Quiz = require('../models/Quiz');
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');

// @desc    Get all quizzes (optional ?classId= filter). Hides correctAnswer for students.
// @route   GET /api/quizzes
// @access  Private (All authenticated users)
const getQuizzes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.class = req.query.classId;
    }

    const quizzes = await Quiz.find(filter)
      .populate('class', 'title subject')
      .populate('createdBy', 'name email role');

    // Never return correctAnswer to student users
    const isStudent = req.user.role === 'student';
    const sanitizedQuizzes = quizzes.map((q) => {
      const quizObj = q.toObject();
      if (isStudent && Array.isArray(quizObj.questions)) {
        quizObj.questions = quizObj.questions.map(({ correctAnswer, ...rest }) => rest);
      }
      return quizObj;
    });

    res.status(200).json({
      success: true,
      message: 'Quizzes fetched successfully',
      data: {
        quizzes: sanitizedQuizzes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz by ID. Hides correctAnswer for students.
// @route   GET /api/quizzes/:id
// @access  Private (All authenticated users)
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('class', 'title subject teacher')
      .populate('createdBy', 'name email role');

    if (!quiz) {
      return next(new ApiError(404, 'Quiz not found'));
    }

    const quizObj = quiz.toObject();

    // Never return correctAnswer to student users
    if (req.user.role === 'student' && Array.isArray(quizObj.questions)) {
      quizObj.questions = quizObj.questions.map(({ correctAnswer, ...rest }) => rest);
    }

    res.status(200).json({
      success: true,
      message: 'Quiz fetched successfully',
      data: {
        quiz: quizObj
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher only, own class only)
const createQuiz = async (req, res, next) => {
  try {
    const { title, class: classId, questions } = req.body;

    // Verify class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    // Verify teacher owns the class
    if (classItem.teacher.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to create quizzes for this class'));
    }

    const quiz = await Quiz.create({
      title,
      class: classId,
      questions,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Teacher only, creator only)
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ApiError(404, 'Quiz not found'));
    }

    // Verify creator ownership
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to update this quiz'));
    }

    const { title, questions } = req.body;
    if (title !== undefined) quiz.title = title;
    if (questions !== undefined) quiz.questions = questions;

    const updatedQuiz = await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        quiz: updatedQuiz
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher only, creator only)
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return next(new ApiError(404, 'Quiz not found'));
    }

    // Verify creator ownership
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to delete this quiz'));
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
};
