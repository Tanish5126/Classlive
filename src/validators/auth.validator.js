// Input validation rules for authentication endpoints
const { body } = require('express-validator');

// Validation rules for user registration
const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher')
];

// Validation rules for user login
const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for Firebase ID token login
const firebaseLoginValidator = [
  body('idToken')
    .trim()
    .notEmpty()
    .withMessage('Firebase idToken is required')
];

// Validation rules for updating FCM push notification token
const fcmTokenValidator = [
  body('fcmToken')
    .trim()
    .notEmpty()
    .withMessage('fcmToken is required')
];

module.exports = {
  registerValidator,
  loginValidator,
  firebaseLoginValidator,
  fcmTokenValidator
};
