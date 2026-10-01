// HTTP and Socket.io server entry point
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

const PORT = process.env.PORT || 5000;

// Create standard Node.js HTTP server wrapping Express
const server = http.createServer(app);

// Attach Socket.io server to the HTTP server with CORS enabled
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Socket.io authentication and classroom event handlers
setupSockets(io);

// Connect to MongoDB and start HTTP + Socket.io server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
