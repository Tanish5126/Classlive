// Session routes definitions with role authorization and validation
const express = require('express');
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
} = require('../controllers/session.controller');
const {
  createSessionValidator,
  updateSessionValidator,
  sessionIdParamValidator,
  sessionQueryValidator
} = require('../validators/session.validator');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Get all sessions with optional ?classId= query filter (any authenticated user)
router.get('/', protect, sessionQueryValidator, validate, getSessions);

// Get single session by ID (any authenticated user)
router.get('/:id', protect, sessionIdParamValidator, validate, getSessionById);

// Create new session (teacher only, verified against class ownership)
router.post(
  '/',
  protect,
  authorize('teacher'),
  createSessionValidator,
  validate,
  createSession
);

// Update session (teacher only, creator verified)
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  updateSessionValidator,
  validate,
  updateSession
);

// Delete session (teacher only, creator verified)
router.delete(
  '/:id',
  protect,
  authorize('teacher'),
  sessionIdParamValidator,
  validate,
  deleteSession
);

module.exports = router;
