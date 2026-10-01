// Authentication route definitions
const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new account (student or teacher)
router.post('/register', registerValidator, validate, register);

// Login existing account
router.post('/login', loginValidator, validate, login);

// Get current authenticated user profile
router.get('/me', protect, getMe);

module.exports = router;
