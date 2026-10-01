// Input validation rules for class management endpoints
const { body, param } = require('express-validator');

// Validation rules for creating a class
const createClassValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Class title is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
];

// Validation rules for updating a class
const updateClassValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid class ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Class title cannot be empty'),
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject cannot be empty'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
];

// Validation rules for endpoints taking class ID as route parameter
const classIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid class ID format')
];

module.exports = {
  createClassValidator,
  updateClassValidator,
  classIdParamValidator
};
