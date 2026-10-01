// Quiz routes definitions with authentication, authorization, and validation
const express = require('express');
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quiz.controller');
const {
  createQuizValidator,
  updateQuizValidator,
  quizIdParamValidator,
  quizQueryValidator
} = require('../validators/quiz.validator');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Get all quizzes (any authenticated user, answer keys hidden for students)
router.get('/', protect, quizQueryValidator, validate, getQuizzes);

// Get single quiz by ID (any authenticated user, answer keys hidden for students)
router.get('/:id', protect, quizIdParamValidator, validate, getQuizById);

// Create new quiz (teacher only, verified against class ownership)
router.post(
  '/',
  protect,
  authorize('teacher'),
  createQuizValidator,
  validate,
  createQuiz
);

// Update quiz (teacher only, creator verified)
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  updateQuizValidator,
  validate,
  updateQuiz
);

// Delete quiz (teacher only, creator verified)
router.delete(
  '/:id',
  protect,
  authorize('teacher'),
  quizIdParamValidator,
  validate,
  deleteQuiz
);

module.exports = router;
