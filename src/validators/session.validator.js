// Input validation rules for session endpoints
const { body, param, query } = require('express-validator');

// Validation rules for creating a session
const createSessionValidator = [
  body('class')
    .isMongoId()
    .withMessage('Valid class ID is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Session title is required'),
  body('scheduledAt')
    .notEmpty()
    .withMessage('Scheduled date and time is required')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['scheduled', 'live', 'ended'])
    .withMessage('Status must be scheduled, live, or ended')
];

// Validation rules for updating a session
const updateSessionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid session ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Session title cannot be empty'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['scheduled', 'live', 'ended'])
    .withMessage('Status must be scheduled, live, or ended')
];

// Validation rules for endpoints taking session ID parameter
const sessionIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid session ID format')
];

// Validation rules for session query parameters
const sessionQueryValidator = [
  query('classId')
    .optional()
    .isMongoId()
    .withMessage('Invalid classId query filter')
];

module.exports = {
  createSessionValidator,
  updateSessionValidator,
  sessionIdParamValidator,
  sessionQueryValidator
};
