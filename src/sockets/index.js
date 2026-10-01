// Socket.io initialization, authentication middleware, and connection routing
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const registerClassroomHandlers = require('./classroom.socket');

module.exports = (io) => {
  // Connection middleware to authenticate clients using JWT
  io.use(async (socket, next) => {
    try {
      // Read token passed by client in auth object: io({ auth: { token: '...' } })
      const token = socket.handshake.auth && socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Verify the JWT signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Load user details from database (excluding password)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user details to socket for use in event listeners
      socket.user = user;
      socket.data.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // When an authenticated client connects
  io.on('connection', (socket) => {
    // Register classroom event handlers for this socket
    registerClassroomHandlers(io, socket);
  });
};
