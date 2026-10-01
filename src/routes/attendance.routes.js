// Attendance routes definitions
const express = require('express');
const {
  markAttendance,
  getAttendance,
  getStudentAttendance
} = require('../controllers/attendance.controller');
const {
  markAttendanceValidator,
  studentIdParamValidator,
  attendanceQueryValidator
} = require('../validators/attendance.validator');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Mark attendance (student marks own if session is live; teacher marks for any student)
router.post(
  '/',
  protect,
  markAttendanceValidator,
  validate,
  markAttendance
);

// Get all attendance records with optional ?sessionId= (teacher only)
router.get(
  '/',
  protect,
  authorize('teacher'),
  attendanceQueryValidator,
  validate,
  getAttendance
);

// Get attendance records for a student (own record for student, or any for teacher)
router.get(
  '/student/:id',
  protect,
  studentIdParamValidator,
  validate,
  getStudentAttendance
);

module.exports = router;
