// Class routes definitions with authentication and role-based access control
const express = require('express');
const {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  joinClass
} = require('../controllers/class.controller');
const {
  createClassValidator,
  updateClassValidator,
  classIdParamValidator
} = require('../validators/class.validator');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Get all classes (any logged-in user)
router.get('/', protect, getClasses);

// Get single class details (any logged-in user)
router.get('/:id', protect, classIdParamValidator, validate, getClassById);

// Create new class (teacher only)
router.post(
  '/',
  protect,
  authorize('teacher'),
  createClassValidator,
  validate,
  createClass
);

// Update class (teacher only, creator verified in controller)
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  updateClassValidator,
  validate,
  updateClass
);

// Delete class (teacher only, creator verified in controller)
router.delete(
  '/:id',
  protect,
  authorize('teacher'),
  classIdParamValidator,
  validate,
  deleteClass
);

// Join a class (student only)
router.post(
  '/:id/join',
  protect,
  authorize('student'),
  classIdParamValidator,
  validate,
  joinClass
);

module.exports = router;
