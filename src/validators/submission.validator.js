// Input validation rules for quiz submission endpoints
const { body, param, query } = require('express-validator');

// Validation rules for submitting quiz answers
const createSubmissionValidator = [
  body('quizId')
    .isMongoId()
    .withMessage('Valid quizId is required'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array of selected option indices'),
  body('answers.*')
    .isInt({ min: 0 })
    .withMessage('Each answer must be a non-negative integer')
];

// Validation rules for student ID param
const studentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID format')
];

// Validation rules for optional query filter ?quizId=
const submissionQueryValidator = [
  query('quizId')
    .optional()
    .isMongoId()
    .withMessage('Invalid quizId query filter')
];

module.exports = {
  createSubmissionValidator,
  studentIdParamValidator,
  submissionQueryValidator
};
