// Submission routes definitions
const express = require('express');
const {
  createSubmission,
  getSubmissions,
  getStudentSubmissions
} = require('../controllers/submission.controller');
const {
  createSubmissionValidator,
  studentIdParamValidator,
  submissionQueryValidator
} = require('../validators/submission.validator');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Submit quiz answers (student only)
router.post(
  '/',
  protect,
  authorize('student'),
  createSubmissionValidator,
  validate,
  createSubmission
);

// Get all submissions with optional ?quizId= (teacher only)
router.get(
  '/',
  protect,
  authorize('teacher'),
  submissionQueryValidator,
  validate,
  getSubmissions
);

// Get submissions for a student (own record for student, or any for teacher)
router.get(
  '/student/:id',
  protect,
  studentIdParamValidator,
  validate,
  getStudentSubmissions
);

module.exports = router;
