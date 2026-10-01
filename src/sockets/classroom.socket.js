// Classroom real-time event handlers (rooms, quiz triggers, mock screen share)
const mongoose = require('mongoose');
const Session = require('../models/Session');

// Helper to broadcast current participants list in a session room
const emitRoomParticipants = async (io, roomName) => {
  try {
    // Find all socket instances currently inside this room
    const sockets = await io.in(roomName).fetchSockets();

    // Map connected sockets to user details (name and role)
    const participants = sockets.map((s) => ({
      userId: s.data?.user?._id || s.user?._id,
      name: s.data?.user?.name || s.user?.name || 'Unknown',
      role: s.data?.user?.role || s.user?.role || 'student'
    }));

    // Broadcast updated list to the entire room
    io.to(roomName).emit('participants', participants);
  } catch (error) {
    console.error('Error broadcasting participants:', error.message);
  }
};

module.exports = (io, socket) => {
  // Helper to ensure an action is performed only by a teacher
  const requireTeacher = () => {
    if (socket.user.role !== 'teacher') {
      socket.emit('error-message', { message: 'Only teachers can do this' });
      return false;
    }
    return true;
  };

  // Event: Client requests to join a live session room
  socket.on('join-session', async (data) => {
    try {
      const sessionId = data && data.sessionId;

      if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        return socket.emit('error-message', { message: 'Valid sessionId is required' });
      }

      // Check if session exists in MongoDB
      const session = await Session.findById(sessionId);
      if (!session) {
        return socket.emit('error-message', { message: 'Session not found' });
      }

      const roomName = `session:${sessionId}`;

      // Join the socket room
      await socket.join(roomName);

      // Notify other participants in the room
      socket.to(roomName).emit('user-joined', {
        userId: socket.user._id,
        name: socket.user.name,
        role: socket.user.role
      });

      // Confirm success to the joining client
      socket.emit('joined-ok', {
        sessionId,
        message: 'Joined session successfully'
      });

      // Broadcast fresh participants list to everyone in the room
      await emitRoomParticipants(io, roomName);
    } catch (error) {
      socket.emit('error-message', { message: error.message });
    }
  });

  // Event: Client leaves a live session room
  socket.on('leave-session', async (data) => {
    try {
      const sessionId = data && data.sessionId;
      if (!sessionId) return;

      const roomName = `session:${sessionId}`;
      await socket.leave(roomName);

      // Notify others in the room
      io.to(roomName).emit('user-left', {
        userId: socket.user._id,
        name: socket.user.name,
        role: socket.user.role
      });

      // Update room participants
      await emitRoomParticipants(io, roomName);
    } catch (error) {
      socket.emit('error-message', { message: error.message });
    }
  });

  // Event: Teacher triggers a quiz for everyone in the room
  socket.on('start-quiz', (data) => {
    if (!requireTeacher()) return;

    const { sessionId, quizId } = data || {};
    if (!sessionId || !quizId) {
      return socket.emit('error-message', { message: 'sessionId and quizId are required' });
    }

    const roomName = `session:${sessionId}`;
    io.to(roomName).emit('quiz-started', {
      quizId,
      startedBy: socket.user.name
    });
  });

  // Event: Teacher starts mock screen share
  socket.on('start-screen-share', (data) => {
    if (!requireTeacher()) return;

    const { sessionId } = data || {};
    if (!sessionId) {
      return socket.emit('error-message', { message: 'sessionId is required' });
    }

    const roomName = `session:${sessionId}`;
    io.to(roomName).emit('screen-share-started', {
      by: socket.user.name
    });
  });

  // Event: Teacher stops mock screen share
  socket.on('stop-screen-share', (data) => {
    if (!requireTeacher()) return;

    const { sessionId } = data || {};
    if (!sessionId) {
      return socket.emit('error-message', { message: 'sessionId is required' });
    }

    const roomName = `session:${sessionId}`;
    io.to(roomName).emit('screen-share-stopped');
  });

  // Handle client disconnection (e.g. browser tab closed)
  socket.on('disconnecting', async () => {
    for (const roomName of socket.rooms) {
      if (roomName.startsWith('session:')) {
        // Notify others that this user left
        socket.to(roomName).emit('user-left', {
          userId: socket.user._id,
          name: socket.user.name,
          role: socket.user.role
        });

        // Broadcast updated participants list excluding the disconnecting socket
        try {
          const sockets = await io.in(roomName).fetchSockets();
          const remaining = sockets
            .filter((s) => s.id !== socket.id)
            .map((s) => ({
              userId: s.data?.user?._id || s.user?._id,
              name: s.data?.user?.name || s.user?.name || 'Unknown',
              role: s.data?.user?.role || s.user?.role || 'student'
            }));
          io.to(roomName).emit('participants', remaining);
        } catch (err) {
          console.error('Error updating participants on disconnect:', err.message);
        }
      }
    }
  });
};
