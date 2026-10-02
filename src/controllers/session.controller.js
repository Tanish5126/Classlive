const Session = require('../models/Session');
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');
const { sendClassNotification } = require('../services/notification.service');

// @desc    Get all sessions (with optional ?classId= query filter)
// @route   GET /api/sessions
// @access  Private (All authenticated users)
const getSessions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.classId) {
      filter.class = req.query.classId;
    }

    const sessions = await Session.find(filter)
      .populate('class', 'title subject teacher')
      .populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Sessions fetched successfully',
      data: {
        sessions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Private (All authenticated users)
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('class', 'title subject teacher')
      .populate('createdBy', 'name email role');

    if (!session) {
      return next(new ApiError(404, 'Session not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Session fetched successfully',
      data: {
        session
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new session for a class
// @route   POST /api/sessions
// @access  Private (Teacher only, own class only)
const createSession = async (req, res, next) => {
  try {
    const { class: classId, title, scheduledAt, status } = req.body;

    // Verify that the referenced class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    // Verify that the logged-in teacher is the owner of the class
    if (classItem.teacher.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to create sessions for this class'));
    }

    // Create session record
    const newSession = await Session.create({
      class: classId,
      title,
      scheduledAt,
      status: status || 'scheduled',
      createdBy: req.user._id
    });

    // Notify students subscribed to the class topic (failures must never break session creation)
    sendClassNotification({
      classId,
      title: 'New Class Session',
      body: `New session scheduled: ${title}`,
      data: {
        sessionId: String(newSession._id)
      }
    }).catch((err) => {
      console.error('Failed to dispatch session notification:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        session: newSession
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a session
// @route   PUT /api/sessions/:id
// @access  Private (Teacher only, creator only)
const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return next(new ApiError(404, 'Session not found'));
    }

    // Verify that the logged-in teacher created this session
    if (session.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to update this session'));
    }

    const { title, scheduledAt, status } = req.body;
    if (title !== undefined) session.title = title;
    if (scheduledAt !== undefined) session.scheduledAt = scheduledAt;
    if (status !== undefined) session.status = status;

    const updatedSession = await session.save();

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: {
        session: updatedSession
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private (Teacher only, creator only)
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return next(new ApiError(404, 'Session not found'));
    }

    // Verify that the logged-in teacher created this session
    if (session.createdBy.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to delete this session'));
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
};
