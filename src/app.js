// Express application configuration and middleware setup
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const classRoutes = require('./routes/class.routes');
const sessionRoutes = require('./routes/session.routes');
const quizRoutes = require('./routes/quiz.routes');
const submissionRoutes = require('./routes/submission.routes');
const attendanceRoutes = require('./routes/attendance.routes');
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

// Resource routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/attendance', attendanceRoutes);

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
