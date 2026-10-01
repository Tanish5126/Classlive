// Class controller handling CRUD operations and student enrollment
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (All authenticated users)
const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'name email role')
      .populate('students', 'name email');

    res.status(200).json({
      success: true,
      message: 'Classes fetched successfully',
      data: {
        classes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private (All authenticated users)
const getClassById = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacher', 'name email role')
      .populate('students', 'name email');

    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Class fetched successfully',
      data: {
        class: classItem
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teacher only)
const createClass = async (req, res, next) => {
  try {
    const { title, description, subject } = req.body;

    // Associate the new class with the logged-in teacher
    const newClass = await Class.create({
      title,
      description,
      subject,
      teacher: req.user._id,
      students: []
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        class: newClass
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Creator teacher only)
const updateClass = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    // Verify that the logged-in teacher is the creator of this class
    if (classItem.teacher.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to update this class'));
    }

    const { title, description, subject } = req.body;
    if (title !== undefined) classItem.title = title;
    if (description !== undefined) classItem.description = description;
    if (subject !== undefined) classItem.subject = subject;

    const updatedClass = await classItem.save();

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: {
        class: updatedClass
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Creator teacher only)
const deleteClass = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    // Verify that the logged-in teacher is the creator of this class
    if (classItem.teacher.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to delete this class'));
    }

    await classItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a class
// @route   POST /api/classes/:id/join
// @access  Private (Student only)
const joinClass = async (req, res, next) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    // Check if the student is already in the class
    const alreadyJoined = classItem.students.some(
      (studentId) => studentId.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(200).json({
        success: true,
        message: 'Already enrolled in this class',
        data: {
          class: classItem
        }
      });
    }

    // Add student to the class list without duplicates
    classItem.students.push(req.user._id);
    await classItem.save();

    res.status(200).json({
      success: true,
      message: 'Joined class successfully',
      data: {
        class: classItem
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  joinClass
};
