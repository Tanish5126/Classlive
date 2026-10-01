// Authentication middleware verifying JWT Bearer token
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check if token exists in header
  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }

  try {
    // Verify token payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'Not authorized, user not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized, invalid or expired token'));
  }
};

module.exports = { protect };
module.exports.protect = protect;
