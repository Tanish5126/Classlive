// Express application configuration and middleware setup
const express = require('express');
const cors = require('cors');

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

module.exports = app;
