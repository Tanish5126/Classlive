// Input validation rules for notification endpoints
const { body } = require('express-validator');

// Validation rules for sending class notifications
const sendNotificationValidator = [
  body('classId')
    .isMongoId()
    .withMessage('Valid classId is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required'),
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Notification body is required')
];

module.exports = {
  sendNotificationValidator
};
