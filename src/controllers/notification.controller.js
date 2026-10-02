// Notification controller handling FCM push notifications for classes
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');
const { sendClassNotification } = require('../services/notification.service');

// @desc    Send push notification to all students in a class
// @route   POST /api/notifications/send
// @access  Private (Teacher only, own class only)
const sendNotification = async (req, res, next) => {
  try {
    const { classId, title, body } = req.body;

    // Verify class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return next(new ApiError(404, 'Class not found'));
    }

    // Verify logged-in teacher is the owner of this class
    if (classItem.teacher.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to send notifications for this class'));
    }

    // Send push notification via FCM topic "class_<classId>"
    const result = await sendClassNotification({
      classId,
      title,
      body
    });

    res.status(200).json({
      success: true,
      message: result.success ? 'Notification sent successfully' : 'Notification processed',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotification
};
