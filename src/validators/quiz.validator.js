// Input validation rules for quiz endpoints
const { body, param, query } = require('express-validator');

// Validation rules for creating a quiz
const createQuizValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required'),
  body('class')
    .isMongoId()
    .withMessage('Valid class ID is required'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Questions must be an array with at least one question'),
  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Each question must have questionText'),
  body('questions.*.options')
    .isArray({ min: 2 })
    .withMessage('Each question must have at least 2 options'),
  body('questions.*.options.*')
    .trim()
    .notEmpty()
    .withMessage('Options cannot be empty strings'),
  body('questions.*.correctAnswer')
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a valid non-negative option index')
];

// Validation rules for updating a quiz
const updateQuizValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid quiz ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Quiz title cannot be empty'),
  body('questions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Questions must be an array with at least one question'),
  body('questions.*.questionText')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each question must have questionText'),
  body('questions.*.options')
    .optional()
    .isArray({ min: 2 })
    .withMessage('Each question must have at least 2 options'),
  body('questions.*.correctAnswer')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Correct answer must be a valid non-negative option index')
];

// Validation rules for quiz ID route parameter
const quizIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid quiz ID format')
];

// Validation rules for optional query filter ?classId=
const quizQueryValidator = [
  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Invalid classId query filter')
];

module.exports = {
  createQuizValidator,
  updateQuizValidator,
  quizIdParamValidator,
  quizQueryValidator
};
