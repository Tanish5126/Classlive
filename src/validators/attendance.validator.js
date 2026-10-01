// Input validation rules for attendance endpoints
const { body, param, query } = require('express-validator');

// Validation rules for marking attendance
const markAttendanceValidator = [
  body('sessionId')
    .isMongoId()
    .withMessage('Valid sessionId is required'),
  body('studentId')
    .optional()
    .isMongoId()
    .withMessage('studentId must be a valid Mongo ID'),
  body('status')
    .optional()
    .isIn(['present', 'absent'])
    .withMessage('Status must be either present or absent')
];

// Validation rules for student ID parameter
const studentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid student ID format')
];

// Validation rules for optional query filter ?sessionId=
const attendanceQueryValidator = [
  query('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid sessionId query filter')
];

module.exports = {
  markAttendanceValidator,
  studentIdParamValidator,
  attendanceQueryValidator
};
