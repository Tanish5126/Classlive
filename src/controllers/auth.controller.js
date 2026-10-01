// Auth controller handling user registration, login, and current user profile
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(400, 'Email already exists'));
    }

    // Create user in database
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    // Generate JWT token for new user
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and explicitly include password field for verification
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Verify entered password against hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
