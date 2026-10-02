// Auth controller handling user registration, login, Firebase auth, and profile management
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const { getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { auth } = require('../config/firebase');

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

// @desc    Login or register via Firebase ID token
// @route   POST /api/auth/firebase-login
// @access  Public
const firebaseLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const authInstance = auth || (getApps().length > 0 ? getAuth() : null);

    if (!authInstance) {
      return next(new ApiError(500, 'Firebase auth is not configured on the server'));
    }

    // Verify the Firebase ID token using the modular getAuth() API
    const decodedToken = await authInstance.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return next(new ApiError(400, 'Firebase token does not contain an email address'));
    }

    // Find user by email or create new student account
    let user = await User.findOne({ email });

    if (!user) {
      // Derive name from Firebase profile name or email prefix
      const name = decodedToken.name || email.split('@')[0];
      // Generate a secure random password satisfying schema requirement
      const randomPassword = crypto.randomBytes(16).toString('hex');

      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: 'student'
      });
    }

    // Generate our own JWT token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Firebase login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    if (error.code && typeof error.code === 'string' && error.code.startsWith('auth/')) {
      return next(new ApiError(401, `Firebase authentication error: ${error.message}`));
    }
    next(error);
  }
};

// @desc    Update FCM device token for logged-in user
// @route   PUT /api/auth/fcm-token
// @access  Private (All authenticated users)
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fcmToken },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
      data: {
        user
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
  firebaseLogin,
  updateFcmToken,
  getMe
};
