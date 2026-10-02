// Push notification routes definitions
const express = require('express');
const { sendNotification } = require('../controllers/notification.controller');
const { sendNotificationValidator } = require('../validators/notification.validator');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Send push notification to a class topic (teacher only)
router.post(
  '/send',
  protect,
  authorize('teacher'),
  sendNotificationValidator,
  validate,
  sendNotification
);

module.exports = router;
