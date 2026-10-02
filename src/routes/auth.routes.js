// Authentication route definitions
const express = require('express');
const {
  register,
  login,
  firebaseLogin,
  updateFcmToken,
  getMe
} = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  firebaseLoginValidator,
  fcmTokenValidator
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new account (student or teacher)
router.post('/register', registerValidator, validate, register);

// Login existing account
router.post('/login', loginValidator, validate, login);

// Firebase ID token login
router.post('/firebase-login', firebaseLoginValidator, validate, firebaseLogin);

// Update FCM token for authenticated user
router.put('/fcm-token', protect, fcmTokenValidator, validate, updateFcmToken);

// Get current authenticated user profile
router.get('/me', protect, getMe);

module.exports = router;
