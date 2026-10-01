// Attendance controller handling student and teacher attendance marking and retrieval
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const ApiError = require('../utils/ApiError');

// @desc    Mark attendance for a session (student marks own if session is live; teacher can mark for any student)
// @route   POST /api/attendance
// @access  Private (Student or Teacher)
const markAttendance = async (req, res, next) => {
  try {
    const { sessionId, studentId, status } = req.body;

    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return next(new ApiError(404, 'Session not found'));
    }

    let targetStudentId;

    if (req.user.role === 'student') {
      // Students can only mark attendance when the session is live
      if (session.status !== 'live') {
        return next(new ApiError(400, 'Attendance can only be marked while session is live'));
      }
      targetStudentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers must specify which student to mark
      if (!studentId) {
        return next(new ApiError(400, 'Teacher must specify studentId'));
      }
      targetStudentId = studentId;
    }

    // Check for duplicate attendance record
    const existingAttendance = await Attendance.findOne({
      session: sessionId,
      student: targetStudentId
    });

    if (existingAttendance) {
      return next(new ApiError(400, 'Attendance already marked for this student in this session'));
    }

    const attendance = await Attendance.create({
      session: sessionId,
      student: targetStudentId,
      status: status || 'present',
      markedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new ApiError(400, 'Attendance already marked for this student in this session'));
    }
    next(error);
  }
};

// @desc    Get all attendance records (optional ?sessionId= filter)
// @route   GET /api/attendance
// @access  Private (Teacher only)
const getAttendance = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.sessionId) {
      filter.session = req.query.sessionId;
    }

    const attendance = await Attendance.find(filter)
      .populate('session', 'title scheduledAt status class')
      .populate('student', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Attendance records fetched successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for a specific student
// @route   GET /api/attendance/student/:id
// @access  Private (Student for own records, or any Teacher)
const getStudentAttendance = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // Students are restricted to their own attendance records
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return next(new ApiError(403, 'Not authorized to view other students\' attendance'));
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate('session', 'title scheduledAt status class')
      .populate('student', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Student attendance records fetched successfully',
      data: {
        attendance
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance
};
