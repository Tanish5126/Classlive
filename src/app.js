// Express application configuration and middleware setup
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse incoming URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ClassLive API running'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
